# 總結與最佳實踐

恭喜完成 Supabase 章節！讓我們回顧學到的內容，以及實務上的建議。

## 學習回顧

### 兩種連線方式

| 方式 | 使用時機 | 優點 |
|------|---------|------|
| **Drizzle ORM** | 複雜查詢、需要 Type Safety | 熟悉的 SQL 思維、完整的 TypeScript 支援 |
| **JS Client** | 需要 Realtime、Auth | 簡潔的 API、內建功能整合 |

### 三個 Demo 涵蓋的功能

```
Demo 1: Notes API
├── Drizzle ORM 連接 Supabase PostgreSQL
├── 關聯資料模型 (users → notes)
└── RESTful CRUD API

Demo 2: Realtime Chat
├── Supabase JS Client
├── Realtime 訂閱 (postgres_changes)
└── 即時訊息同步

Demo 3: Todo + Auth
├── Email/Password 認證
├── JWT 驗證 Middleware
├── Row Level Security (RLS)
└── 前端狀態管理 (Pinia)
```

## 何時選擇 Supabase？

### 適合使用 Supabase

- 需要快速建立 MVP
- 需要即時功能（聊天、通知、協作）
- 需要認證系統但不想自己建
- 團隊熟悉 PostgreSQL
- 專案規模中小型

### 可能需要考慮其他方案

- 需要完全掌控基礎設施
- 有特殊的資料庫需求（如 Graph DB）
- 需要極致的效能調校
- 已有成熟的自建系統

## 最佳實踐

### 1. 環境變數管理

```bash
# .env.template
SUPABASE_URL=your_project_url
SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SECRET_KEY=your_secret_key  # 僅後端使用
DATABASE_URL=your_postgres_url              # Drizzle 使用
```

永遠不要將 `.env` 提交到版本控制！

### 2. Secret Key 安全

```javascript
// ❌ 錯誤：在前端使用 Secret Key
const supabase = createClient(url, secretKey)

// ✅ 正確：前端只使用 Publishable Key
const supabase = createClient(url, publishableKey)

// ✅ 正確：Secret Key 只在後端使用
// backend/src/config/supabase.js
const supabaseAdmin = createClient(url, secretKey)
```

### 3. RLS 策略設計

```sql
-- 基本原則：預設拒絕，明確允許

-- 啟用 RLS
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 明確定義每個操作的權限
CREATE POLICY "select_own" ON todos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own" ON todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own" ON todos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "delete_own" ON todos
  FOR DELETE USING (auth.uid() = user_id);
```

### 4. 錯誤處理

```javascript
// 統一的錯誤處理格式
export const handleSupabaseError = (error) => {
  if (error.code === 'PGRST116') {
    return { status: 404, message: '資源不存在' }
  }
  if (error.code === '23505') {
    return { status: 409, message: '資源已存在' }
  }
  if (error.code === '42501') {
    return { status: 403, message: '權限不足' }
  }
  return { status: 500, message: '伺服器錯誤' }
}
```

### 5. Realtime 訂閱清理

```javascript
// 元件卸載時一定要取消訂閱
onUnmounted(() => {
  if (subscription) {
    subscription.unsubscribe()
  }
})

// 或使用 Vue 的 watchEffect 自動清理
watchEffect((onCleanup) => {
  const sub = subscribeToMessages(roomId, handleNewMessage)
  onCleanup(() => sub.unsubscribe())
})
```

## 專案結構建議

```
project/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js    # Drizzle 連線
│   │   │   └── supabase.js    # JS Client
│   │   ├── db/
│   │   │   └── schema.js      # Drizzle Schema
│   │   ├── middleware/
│   │   │   └── auth.js        # JWT 驗證
│   │   ├── services/          # 商業邏輯
│   │   ├── controllers/       # 請求處理
│   │   └── routes/            # 路由定義
│   ├── drizzle/               # Migration 檔案
│   ├── setup.sql              # RLS 政策
│   └── package.json
│
└── frontend/
    └── src/
        ├── services/
        │   ├── api.js         # HTTP Client
        │   └── supabase.js    # Realtime 訂閱
        ├── stores/            # 狀態管理
        ├── router/            # 路由守衛
        ├── views/
        └── components/
```

## 延伸學習

### Supabase 其他功能

- **Storage**：檔案儲存，支援圖片、影片
- **Edge Functions**：Serverless 函數
- **Database Webhooks**：資料變更觸發 HTTP 請求
- **Vault**：敏感資料加密儲存

### 進階主題

- **Database Migrations**：使用 Supabase CLI 管理 Schema
- **Type Generation**：自動生成 TypeScript 型別
- **Branching**：資料庫分支（類似 Git）
- **Self-hosting**：自架 Supabase

## 資源連結

- [Supabase 官方文件](https://supabase.com/docs)
- [Supabase GitHub](https://github.com/supabase/supabase)
- [Drizzle ORM 文件](https://orm.drizzle.team)
- [Vue.js 文件](https://vuejs.org)
- [Pinia 文件](https://pinia.vuejs.org)

## Demo 快速啟動

```bash
# Demo 1: Notes API
cd demo_01_notes_api/backend && npm install && npm run dev
cd demo_01_notes_api/frontend && npm install && npm run dev

# Demo 2: Realtime Chat
cd demo_02_realtime_chat/backend && npm install && npm run dev
cd demo_02_realtime_chat/frontend && npm install && npm run dev

# Demo 3: Todo + Auth
cd demo_03_todo_auth/backend && npm install && npm run dev
cd demo_03_todo_auth/frontend && npm install && npm run dev
```

記得先：
1. 在 Supabase Dashboard 建立專案
2. 執行各 Demo 的 `setup.sql`
3. 複製 `.env.template` 為 `.env` 並填入環境變數

---

這就是 Supabase 章節的全部內容！希望這些教學和範例能幫助你快速上手 Supabase，建立出色的應用程式。
