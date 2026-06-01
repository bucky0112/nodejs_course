# Supabase Authentication

Supabase 內建完整的認證系統，支援 Email/Password、OAuth（Google、GitHub 等）、Magic Link 等多種認證方式。

## Auth 架構

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                           │
│  ┌──────────────┐   ┌──────────────┐                   │
│  │ Login Form   │   │ Auth State   │ (Pinia/Context)   │
│  └──────┬───────┘   └──────────────┘                   │
│         │                                               │
└─────────┼───────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│                      Backend                            │
│  ┌──────────────┐   ┌──────────────┐                   │
│  │ Auth Routes  │ → │ Supabase SDK │                   │
│  └──────────────┘   └──────┬───────┘                   │
│                            │                            │
└────────────────────────────┼────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    Supabase Auth                        │
│  ┌──────────────┐   ┌──────────────┐                   │
│  │ auth.users   │   │ JWT Tokens   │                   │
│  └──────────────┘   └──────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

## 註冊使用者

使用 `signUp` 方法建立新使用者：

```javascript
// backend/src/controllers/authController.js
import { supabase } from '../config/supabase.js'

export const register = async (req, res) => {
  const { email, password } = req.body

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.status(201).json({
    message: '註冊成功',
    data: {
      user: data.user,
      session: data.session
    }
  })
}
```

> 注意：Supabase 預設會發送驗證信。在開發階段可以到 Dashboard → Authentication → Email Templates 關閉 "Confirm email"。

## 登入

使用 `signInWithPassword` 進行密碼登入：

```javascript
export const login = async (req, res) => {
  const { email, password } = req.body

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    return res.status(401).json({ error: error.message })
  }

  res.json({
    message: '登入成功',
    data: {
      user: data.user,
      session: data.session
    }
  })
}
```

成功登入後會回傳：
- `access_token`：JWT，用於後續 API 請求
- `refresh_token`：用於更新 access_token
- `user`：使用者資訊

## JWT 驗證 Middleware

後端需要驗證前端送來的 JWT：

```javascript
// backend/src/middleware/authMiddleware.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
)

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未提供認證 Token' })
  }

  const token = authHeader.split(' ')[1]

  // 使用 Supabase 驗證 JWT
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return res.status(401).json({ error: 'Token 無效或已過期' })
  }

  // 將使用者資訊附加到 request
  req.user = user
  req.accessToken = token
  next()
}
```

使用方式：

```javascript
// backend/src/routes/index.js
import { authMiddleware } from '../middleware/authMiddleware.js'

// 受保護的路由
router.use('/todos', authMiddleware, todoRoutes)
```

## 取得目前使用者

```javascript
export const me = async (req, res) => {
  // req.user 已由 middleware 設定
  res.json({
    data: req.user
  })
}
```

## 登出

```javascript
export const logout = async (req, res) => {
  const { error } = await supabase.auth.signOut()

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.json({ message: '登出成功' })
}
```

## 前端整合

### Pinia Auth Store

```javascript
// frontend/src/stores/authStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('access_token') || null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // 設定 token
  const setToken = (accessToken) => {
    token.value = accessToken
    if (accessToken) {
      localStorage.setItem('access_token', accessToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    } else {
      localStorage.removeItem('access_token')
      delete api.defaults.headers.common['Authorization']
    }
  }

  // 初始化：頁面載入時檢查 token
  const initialize = async () => {
    if (token.value) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      try {
        const res = await api.get('/auth/me')
        user.value = res.data.data
      } catch (err) {
        // Token 無效，清除
        setToken(null)
        user.value = null
      }
    }
  }

  // 登入
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { user: userData, session } = res.data.data

    user.value = userData
    setToken(session.access_token)

    return res.data
  }

  // 登出
  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (err) {
      // 忽略錯誤
    }
    user.value = null
    setToken(null)
  }

  return { user, token, isAuthenticated, initialize, login, logout }
})
```

### 路由守衛

```javascript
// frontend/src/router/index.js
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 如果有 token 但還沒取得使用者資料
  if (!authStore.user && authStore.token) {
    await authStore.initialize()
  }

  // 需要登入的頁面
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }

  // 訪客頁面（已登入就跳轉）
  if (to.meta.guest && authStore.isAuthenticated) {
    return next('/todos')
  }

  next()
})
```

## Row Level Security (RLS)

RLS 讓你在資料庫層級控制資料存取權限。

### 啟用 RLS

```sql
-- 對 todos 表啟用 RLS
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
```

### 建立存取政策

```sql
-- 使用者只能查看自己的 todos
CREATE POLICY "Users can view own todos"
ON todos FOR SELECT
USING (auth.uid() = user_id);

-- 使用者只能新增自己的 todos
CREATE POLICY "Users can insert own todos"
ON todos FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 使用者只能更新自己的 todos
CREATE POLICY "Users can update own todos"
ON todos FOR UPDATE
USING (auth.uid() = user_id);

-- 使用者只能刪除自己的 todos
CREATE POLICY "Users can delete own todos"
ON todos FOR DELETE
USING (auth.uid() = user_id);
```

### RLS 運作原理

```
┌────────────────────────────────────────────────────────┐
│  SELECT * FROM todos                                   │
│                                                        │
│  使用者 A 的請求 (user_id = 'aaa')                     │
│  ↓                                                     │
│  實際執行: SELECT * FROM todos WHERE user_id = 'aaa'  │
│  結果: 只有 user_id = 'aaa' 的資料                     │
│                                                        │
│  使用者 B 的請求 (user_id = 'bbb')                     │
│  ↓                                                     │
│  實際執行: SELECT * FROM todos WHERE user_id = 'bbb'  │
│  結果: 只有 user_id = 'bbb' 的資料                     │
└────────────────────────────────────────────────────────┘
```

`auth.uid()` 是 Supabase 提供的函數，會自動從 JWT 中取得當前使用者的 ID。

## Service Role Key

如果後端需要繞過 RLS（例如管理員操作），可以使用 Service Role Key：

```javascript
// 使用 Service Role Key 建立的 client 會繞過 RLS
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
```

> 警告：Service Role Key 擁有完整權限，絕對不要在前端使用！

## 完整的 Auth 流程

```
1. 使用者在前端填寫登入表單
          ↓
2. 前端發送 POST /api/auth/login
          ↓
3. 後端呼叫 supabase.auth.signInWithPassword
          ↓
4. Supabase 驗證成功，回傳 JWT
          ↓
5. 後端將 JWT 回傳給前端
          ↓
6. 前端儲存 JWT 到 localStorage
          ↓
7. 後續請求都帶上 Authorization: Bearer <token>
          ↓
8. 後端 middleware 驗證 JWT
          ↓
9. 若使用 RLS，資料庫也會根據 JWT 過濾資料
```

## Demo 參考

完整範例請參考 `demo_03_todo_auth/`：

```
demo_03_todo_auth/
├── backend/
│   ├── src/
│   │   ├── config/supabase.js
│   │   ├── middleware/authMiddleware.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── todoController.js
│   │   └── routes/
│   └── setup.sql          # RLS 設定
└── frontend/
    └── src/
        ├── stores/authStore.js
        ├── router/index.js
        └── views/
            ├── LoginView.vue
            ├── RegisterView.vue
            └── TodosView.vue
```

## 下一步

- [06-putting-it-together.md](./06-putting-it-together.md) - 總結與最佳實踐
