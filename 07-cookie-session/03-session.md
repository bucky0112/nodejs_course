# Session 是什麼？

## 定義

Session 是伺服器端的狀態管理機制：

- 伺服器為每個用戶建立一個「會話」
- 用一個唯一的 Session ID 識別
- 實際資料存在伺服器端

```
┌─────────────┐                         ┌─────────────┐
│   瀏覽器    │                         │   伺服器    │
│             │  ─── Session ID ────▶   │             │
│ Cookie:     │                         │ Session 儲存:│
│ sid=abc123  │  ◀── 查詢 abc123 ────   │ abc123: {   │
│             │      的用戶資料          │   user: ... │
└─────────────┘                         │   cart: ... │
                                        │ }           │
                                        └─────────────┘
```

## Session vs Cookie 的差異

| 比較項目 | Cookie | Session |
|---------|--------|---------|
| 儲存位置 | 瀏覽器（客戶端） | 伺服器端 |
| 安全性 | 較低，用戶可看到/修改 | 較高，用戶只有 ID |
| 大小限制 | 約 4KB | 無限制（取決於伺服器） |
| 生命週期 | 可設很長 | 通常較短，關閉瀏覽器可能消失 |
| 伺服器負擔 | 無 | 需要儲存空間和查詢 |

## 在 Express 中使用 Session

### 安裝 express-session

```bash
npm install express-session
```

### 基本設定

```javascript
import express from 'express'
import session from 'express-session'

const app = express()

app.use(session({
  secret: 'your-secret-key',  // 用來簽名 Session ID
  resave: false,              // 沒變更時不重新儲存
  saveUninitialized: false,   // 不儲存空的 Session
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 天
    httpOnly: true,
    secure: false  // 開發環境用 false，正式環境改 true
  }
}))
```

### 使用 Session

```javascript
// 登入：設定 Session
app.post('/login', (req, res) => {
  const { username, password } = req.body

  // 驗證帳密（簡化範例）
  if (username === 'john' && password === '1234') {
    req.session.user = {
      id: 1,
      username: 'john',
      role: 'admin'
    }
    res.json({ message: '登入成功' })
  } else {
    res.status(401).json({ message: '帳號或密碼錯誤' })
  }
})

// 檢查登入狀態
app.get('/profile', (req, res) => {
  if (req.session.user) {
    res.json({
      message: `歡迎，${req.session.user.username}`,
      user: req.session.user
    })
  } else {
    res.status(401).json({ message: '請先登入' })
  }
})

// 登出：銷毀 Session
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: '登出失敗' })
    }
    res.clearCookie('connect.sid') // 清除 Session Cookie
    res.json({ message: '已登出' })
  })
})
```

## Session 儲存方式

預設情況下，Session 存在記憶體中，但這有問題：
- 伺服器重啟就消失
- 多台伺服器無法共享

### 常見的 Session Store

| Store | 適用場景 |
|-------|---------|
| Memory（預設） | 開發測試 |
| Redis | 正式環境首選，高效能 |
| PostgreSQL | 已有 PostgreSQL 的專案 |
| MongoDB | 已有 MongoDB 的專案 |

### 使用 PostgreSQL 儲存 Session

```bash
npm install connect-pg-simple
```

```javascript
import session from 'express-session'
import pgSession from 'connect-pg-simple'
import pg from 'pg'

const PgStore = pgSession(session)
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
})

app.use(session({
  store: new PgStore({
    pool: pool,
    tableName: 'user_sessions' // 自訂表格名稱
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}))
```

## Session 設定說明

```javascript
app.use(session({
  secret: 'key',          // 必填！用來簽名 Session ID
  name: 'sessionId',      // Cookie 名稱，預設 connect.sid
  resave: false,          // 每次請求是否重新儲存（建議 false）
  saveUninitialized: false, // 是否儲存空 Session（建議 false）
  rolling: true,          // 每次請求更新過期時間
  cookie: {
    maxAge: 3600000,      // Cookie 存活時間
    httpOnly: true,       // 防止 XSS
    secure: true,         // 只在 HTTPS 使用
    sameSite: 'strict'    // 防止 CSRF
  }
}))
```

## 建立驗證 Middleware

```javascript
// 驗證是否已登入
const requireAuth = (req, res, next) => {
  if (req.session.user) {
    next()
  } else {
    res.status(401).json({ message: '請先登入' })
  }
}

// 驗證是否為管理員
const requireAdmin = (req, res, next) => {
  if (req.session.user?.role === 'admin') {
    next()
  } else {
    res.status(403).json({ message: '權限不足' })
  }
}

// 使用 Middleware
app.get('/dashboard', requireAuth, (req, res) => {
  res.json({ message: '歡迎來到儀表板' })
})

app.delete('/users/:id', requireAuth, requireAdmin, (req, res) => {
  // 只有管理員能刪除用戶
})
```

## Session 的優缺點

### 優點
- 安全：敏感資料不暴露給客戶端
- 彈性：可存任意大小的資料
- 可控：伺服器端可隨時撤銷

### 缺點
- 有狀態：需要額外儲存空間
- 擴展性：多台伺服器需要共享 Session Store
- 效能：每次請求都要查詢 Session Store

## 下一步

現在你了解了 Session-based 認證，接下來我們會比較它與 JWT（Token-based）認證的差異，幫助你選擇適合的方案！
