# 資料庫 CRUD 操作

本章節搭配 **Demo 1: Notes API** 學習如何使用 Drizzle ORM 連接 Supabase 進行資料庫操作。

## Demo 1 專案結構

```
demo_01_notes_api/
├── backend/
│   ├── index.js
│   ├── package.json
│   ├── drizzle.config.js
│   └── src/
│       ├── app.js
│       ├── config/database.js    ← Drizzle 連線設定
│       ├── db/schema.js          ← 資料表定義
│       ├── services/             ← 資料庫操作
│       ├── controllers/          ← API 邏輯
│       └── routes/               ← 路由定義
└── frontend/
    └── ...                       ← Vue.js 前端
```

## 啟動專案

### 1. 設定環境變數

```bash
cd demo_01_notes_api/backend
cp .env.template .env
# 編輯 .env，填入你的 Supabase DATABASE_URL
```

### 2. 安裝依賴並建立資料表

```bash
npm install
npm run db:push
```

### 3. 啟動伺服器

```bash
npm run dev
```

## Schema 定義

```javascript
// src/db/schema.js
import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow()
})

export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

// 定義關聯
export const usersRelations = relations(users, ({ many }) => ({
  notes: many(notes)
}))

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id]
  })
}))
```

## CRUD 操作範例

### Create（新增）

```javascript
// services/noteService.js
async create(data) {
  const result = await db.insert(notes).values(data).returning()
  return result[0]
}

// 使用
await noteService.create({
  title: 'Hello',
  content: 'World',
  userId: 1
})
```

### Read（查詢）

```javascript
// 查詢全部（含關聯）
async findAll() {
  return await db.query.notes.findMany({
    with: {
      user: true  // 載入 user 關聯
    },
    orderBy: (notes, { desc }) => [desc(notes.createdAt)]
  })
}

// 查詢單筆
async findById(id) {
  return await db.query.notes.findFirst({
    where: eq(notes.id, id),
    with: {
      user: true
    }
  })
}

// 條件查詢
async findByUserId(userId) {
  return await db.query.notes.findMany({
    where: eq(notes.userId, userId)
  })
}
```

### Update（更新）

```javascript
async update(id, data) {
  const result = await db
    .update(notes)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(notes.id, id))
    .returning()
  return result[0]
}
```

### Delete（刪除）

```javascript
async delete(id) {
  const result = await db
    .delete(notes)
    .where(eq(notes.id, id))
    .returning()
  return result[0]
}
```

## API 端點

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/users` | 取得所有使用者 |
| GET | `/api/users/:id` | 取得單一使用者 |
| POST | `/api/users` | 新增使用者 |
| PUT | `/api/users/:id` | 更新使用者 |
| DELETE | `/api/users/:id` | 刪除使用者 |
| GET | `/api/notes` | 取得所有筆記 |
| GET | `/api/notes?userId=1` | 取得特定使用者的筆記 |
| GET | `/api/notes/:id` | 取得單一筆記 |
| POST | `/api/notes` | 新增筆記 |
| PUT | `/api/notes/:id` | 更新筆記 |
| DELETE | `/api/notes/:id` | 刪除筆記 |

## 測試 API

使用 curl 或 REST Client 測試：

```bash
# 新增使用者
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@example.com"}'

# 新增筆記
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title": "My Note", "content": "Hello World", "userId": 1}'

# 查詢所有筆記
curl http://localhost:3000/api/notes
```

## 錯誤處理

### 常見錯誤碼

| 錯誤碼 | 說明 | 處理方式 |
|--------|------|---------|
| `23505` | Unique constraint violation | Email 已存在 |
| `23503` | Foreign key violation | 參照的使用者不存在 |

### Controller 錯誤處理範例

```javascript
async create(req, res, next) {
  try {
    const user = await userService.create(req.body)
    res.status(201).json({ success: true, data: user })
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ success: false, error: 'Email already exists' })
    }
    next(error)
  }
}
```

## 在 Supabase Dashboard 查看資料

1. 登入 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇你的專案
3. 點擊左側的 **Table Editor**
4. 你可以在這裡直接查看、編輯、新增資料

## 重點整理

- Supabase 的 `DATABASE_URL` 就是標準的 PostgreSQL 連線字串
- 使用 Drizzle ORM 的方式與連接本地 PostgreSQL 完全相同
- `drizzle-kit push` 可以直接將 schema 推送到 Supabase
- 在 Supabase Dashboard 可以視覺化管理資料

下一章，我們將學習 Supabase 的 Realtime 功能！
