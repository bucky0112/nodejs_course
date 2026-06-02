# 記事本 API v2 專案

這是本課程的最終實作專案！

你將運用所有學到的知識，建立一個完整的記事本 API。

---

## 專案概述

### 功能需求

| 資源 | 端點 | 說明 |
|------|------|------|
| **Users** | | |
| | GET /api/users | 取得所有使用者 |
| | GET /api/users/stats | 取得使用者統計（含筆記數） |
| | GET /api/users/:id | 取得單一使用者 |
| | GET /api/users/:id/notes | 取得使用者及其筆記 |
| | POST /api/users | 建立使用者 |
| | PUT /api/users/:id | 更新使用者 |
| | DELETE /api/users/:id | 刪除使用者 |
| **Notes** | | |
| | GET /api/notes | 取得所有筆記（含作者） |
| | GET /api/notes/:id | 取得單一筆記（含作者） |
| | POST /api/notes | 建立筆記 |
| | PUT /api/notes/:id | 更新筆記 |
| | DELETE /api/notes/:id | 刪除筆記 |

### 技術規格

- Node.js + Express v5.1.0
- Drizzle ORM + PostgreSQL
- JavaScript (ESM)
- 分層架構（Service → Controller → Route）

---

## 專案結構

```
notes_api_demo/
├── package.json              # 專案設定
├── drizzle.config.js         # Drizzle Kit 設定
├── index.js                  # 應用程式入口（很簡短）
├── .env.template             # 環境變數範本
├── .env                      # 環境變數（不要 commit！）
│
├── src/
│   ├── app.js                # Express 應用設定
│   │
│   ├── config/               # 環境設定
│   │   ├── index.js          # 環境變數統一管理
│   │   └── database.js       # 資料庫連線
│   │
│   ├── db/                   # 資料庫相關
│   │   └── schema.js         # Drizzle Schema 定義
│   │
│   ├── middleware/           # 中間件
│   │   └── errorHandler.js   # 錯誤處理
│   │
│   ├── services/             # 服務層（資料庫操作）
│   │   ├── userService.js    # User 相關操作
│   │   └── noteService.js    # Note 相關操作
│   │
│   ├── controllers/          # 控制器（處理請求回應）
│   │   ├── userController.js
│   │   └── noteController.js
│   │
│   └── routes/               # 路由定義
│       ├── index.js          # 路由匯總
│       ├── users.js          # Users 路由
│       └── notes.js          # Notes 路由
│
└── drizzle/                  # Migration 檔案（自動生成）
```

### 分層架構說明

| 層級 | 職責 | 檔案 |
|------|------|------|
| **Config** | 環境設定、資料庫連線 | `config/index.js`, `config/database.js` |
| **Schema** | 資料表結構定義 | `db/schema.js` |
| **Service** | 資料庫操作、業務邏輯 | `services/*.js` |
| **Controller** | 接收請求、呼叫 Service、回傳回應 | `controllers/*.js` |
| **Route** | 定義 URL 路徑 | `routes/*.js` |
| **Middleware** | 錯誤處理、驗證 | `middleware/*.js` |

---

## 快速開始

### 1. 進入專案目錄

```bash
cd notes_api_demo
```

### 2. 安裝套件

```bash
npm install
```

### 3. 設定環境變數

```bash
# 複製範本
cp .env.template .env

# 編輯 .env，填入你的 PostgreSQL 連線資訊
```

### 4. 建立資料庫

在 pgAdmin 或終端機中：

```sql
CREATE DATABASE notes_app;
```

### 5. 產生並執行 Migration

先依 schema 產生 migration 檔，再套用到資料庫：

```bash
npm run generate   # 依 schema 產生 SQL migration 檔到 drizzle/
npm run migrate    # 套用 migration，實際建立資料表
```

> 若略過 `generate`，`drizzle/` 內沒有 migration 檔，`migrate` 不會建表，
> 第一次打 API 就會得到 `relation "users" does not exist`。
> 也可改用 `npm run push` 直接把 schema 同步到資料庫（開發階段較方便）。

### 6. 啟動開發伺服器

```bash
npm run dev
```

伺服器會在 `http://localhost:3000` 啟動！

---

## Schema 設計

### users 表

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | SERIAL | 主鍵，自動遞增 |
| name | VARCHAR(100) | 姓名，必填 |
| email | VARCHAR(255) | 信箱，必填，唯一 |
| created_at | TIMESTAMP | 建立時間，預設為當前時間 |

### notes 表

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | SERIAL | 主鍵，自動遞增 |
| title | VARCHAR(255) | 標題，必填 |
| content | TEXT | 內容 |
| user_id | INTEGER | 外鍵，關聯 users.id |
| created_at | TIMESTAMP | 建立時間 |
| updated_at | TIMESTAMP | 更新時間 |

### 關聯

- 一個 User 可以有多個 Notes (One-to-Many)
- 一個 Note 屬於一個 User (Many-to-One)
- 刪除 User 時，其 Notes 也會被刪除 (CASCADE)

---

## 完整程式碼

### 環境設定：src/config/index.js

```javascript
import 'dotenv/config'

const config = {
  // 伺服器設定
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // 資料庫設定
  databaseUrl: process.env.DATABASE_URL
}

export default config
```

### 資料庫連線：src/config/database.js

```javascript
import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import config from './index.js'
import * as schema from '../db/schema.js'

const { Pool } = pg

const pool = new Pool({
  connectionString: config.databaseUrl
})

// 傳入 schema 以啟用 Query API
const db = drizzle(pool, { schema })

export default db
```

### Schema 定義：src/db/schema.js

```javascript
import { pgTable, serial, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ============ Users 表 ============
export const usersTable = pgTable("users", {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow()
})

// ============ Notes 表 ============
export const notesTable = pgTable("notes", {
  id: serial().primaryKey(),
  title: varchar({ length: 255 }).notNull(),
  content: text(),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
})

// ============ Relations 定義 ============
export const usersRelations = relations(usersTable, ({ many }) => ({
  notes: many(notesTable)
}))

export const notesRelations = relations(notesTable, ({ one }) => ({
  author: one(usersTable, {
    fields: [notesTable.userId],
    references: [usersTable.id]
  })
}))
```

---

## Service 層：資料庫操作

### src/services/userService.js

```javascript
import db from '../config/database.js'
import { usersTable, notesTable } from '../db/schema.js'
import { eq, count } from 'drizzle-orm'

export const userService = {
  // 取得所有使用者
  async findAll() {
    return await db.select().from(usersTable)
  },

  // 根據 ID 取得使用者
  async findById(id) {
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
    return users[0] || null
  },

  // 取得使用者及其筆記（Query API）
  async findByIdWithNotes(id) {
    return await db.query.usersTable.findFirst({
      where: eq(usersTable.id, id),
      with: {
        notes: {
          orderBy: (notes, { desc }) => [desc(notes.createdAt)]
        }
      }
    })
  },

  // 取得所有使用者及筆記數量（leftJoin + 聚合）
  async findAllWithNoteCount() {
    return await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        createdAt: usersTable.createdAt,
        noteCount: count(notesTable.id)
      })
      .from(usersTable)
      .leftJoin(notesTable, eq(usersTable.id, notesTable.userId))
      .groupBy(usersTable.id, usersTable.name, usersTable.email, usersTable.createdAt)
  },

  // 建立使用者
  async create(data) {
    const result = await db
      .insert(usersTable)
      .values(data)
      .returning()
    return result[0]
  },

  // 更新使用者
  async update(id, data) {
    const result = await db
      .update(usersTable)
      .set(data)
      .where(eq(usersTable.id, id))
      .returning()
    return result[0] || null
  },

  // 刪除使用者
  async delete(id) {
    const result = await db
      .delete(usersTable)
      .where(eq(usersTable.id, id))
      .returning()
    return result[0] || null
  }
}
```

### src/services/noteService.js

```javascript
import db from '../config/database.js'
import { notesTable } from '../db/schema.js'
import { eq } from 'drizzle-orm'

export const noteService = {
  // 取得所有筆記
  async findAll() {
    return await db.select().from(notesTable)
  },

  // 取得所有筆記及作者（Query API）
  async findAllWithAuthor() {
    return await db.query.notesTable.findMany({
      with: {
        author: true
      },
      orderBy: (notes, { desc }) => [desc(notes.createdAt)]
    })
  },

  // 根據 ID 取得筆記
  async findById(id) {
    const notes = await db
      .select()
      .from(notesTable)
      .where(eq(notesTable.id, id))
    return notes[0] || null
  },

  // 取得筆記及作者（Query API）
  async findByIdWithAuthor(id) {
    return await db.query.notesTable.findFirst({
      where: eq(notesTable.id, id),
      with: {
        author: true
      }
    })
  },

  // 建立筆記
  async create(data) {
    const result = await db
      .insert(notesTable)
      .values(data)
      .returning()
    return result[0]
  },

  // 更新筆記
  async update(id, data) {
    const result = await db
      .update(notesTable)
      .set({
        ...data,
        updatedAt: new Date()  // 自動更新時間
      })
      .where(eq(notesTable.id, id))
      .returning()
    return result[0] || null
  },

  // 刪除筆記
  async delete(id) {
    const result = await db
      .delete(notesTable)
      .where(eq(notesTable.id, id))
      .returning()
    return result[0] || null
  }
}
```

---

## Controller 層：處理請求回應

### src/controllers/userController.js

```javascript
import { userService } from '../services/userService.js'

export const userController = {
  // GET /api/users
  async getAll(req, res, next) {
    try {
      const users = await userService.findAll()
      res.json({ success: true, data: users })
    } catch (error) {
      next(error)
    }
  },

  // GET /api/users/stats
  async getStats(req, res, next) {
    try {
      const stats = await userService.findAllWithNoteCount()
      res.json({ success: true, data: stats })
    } catch (error) {
      next(error)
    }
  },

  // GET /api/users/:id
  async getById(req, res, next) {
    try {
      const id = parseInt(req.params.id)
      const user = await userService.findById(id)

      if (!user) {
        return res.status(404).json({
          success: false,
          error: '找不到使用者'
        })
      }

      res.json({ success: true, data: user })
    } catch (error) {
      next(error)
    }
  },

  // GET /api/users/:id/notes
  async getWithNotes(req, res, next) {
    try {
      const id = parseInt(req.params.id)
      const user = await userService.findByIdWithNotes(id)

      if (!user) {
        return res.status(404).json({
          success: false,
          error: '找不到使用者'
        })
      }

      res.json({ success: true, data: user })
    } catch (error) {
      next(error)
    }
  },

  // POST /api/users
  async create(req, res, next) {
    try {
      const { name, email } = req.body

      if (!name || !email) {
        return res.status(400).json({
          success: false,
          error: 'name 和 email 為必填'
        })
      }

      const newUser = await userService.create({ name, email })
      res.status(201).json({ success: true, data: newUser })
    } catch (error) {
      // 處理 email 重複錯誤
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          error: 'Email 已被使用'
        })
      }
      next(error)
    }
  },

  // PUT /api/users/:id
  async update(req, res, next) {
    try {
      const id = parseInt(req.params.id)
      const updatedUser = await userService.update(id, req.body)

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          error: '找不到使用者'
        })
      }

      res.json({ success: true, data: updatedUser })
    } catch (error) {
      next(error)
    }
  },

  // DELETE /api/users/:id
  async delete(req, res, next) {
    try {
      const id = parseInt(req.params.id)
      const deletedUser = await userService.delete(id)

      if (!deletedUser) {
        return res.status(404).json({
          success: false,
          error: '找不到使用者'
        })
      }

      res.json({
        success: true,
        message: '使用者已刪除',
        data: deletedUser
      })
    } catch (error) {
      next(error)
    }
  }
}
```

### src/controllers/noteController.js

```javascript
import { noteService } from '../services/noteService.js'

export const noteController = {
  // GET /api/notes
  async getAll(req, res, next) {
    try {
      const notes = await noteService.findAllWithAuthor()
      res.json({ success: true, data: notes })
    } catch (error) {
      next(error)
    }
  },

  // GET /api/notes/:id
  async getById(req, res, next) {
    try {
      const id = parseInt(req.params.id)
      const note = await noteService.findByIdWithAuthor(id)

      if (!note) {
        return res.status(404).json({
          success: false,
          error: '找不到筆記'
        })
      }

      res.json({ success: true, data: note })
    } catch (error) {
      next(error)
    }
  },

  // POST /api/notes
  async create(req, res, next) {
    try {
      const { title, content, userId } = req.body

      if (!title) {
        return res.status(400).json({
          success: false,
          error: 'title 為必填'
        })
      }

      const newNote = await noteService.create({ title, content, userId })
      res.status(201).json({ success: true, data: newNote })
    } catch (error) {
      // 處理外鍵錯誤
      if (error.code === '23503') {
        return res.status(400).json({
          success: false,
          error: '使用者不存在'
        })
      }
      next(error)
    }
  },

  // PUT /api/notes/:id
  async update(req, res, next) {
    try {
      const id = parseInt(req.params.id)
      const { title, content } = req.body

      const updatedNote = await noteService.update(id, { title, content })

      if (!updatedNote) {
        return res.status(404).json({
          success: false,
          error: '找不到筆記'
        })
      }

      res.json({ success: true, data: updatedNote })
    } catch (error) {
      next(error)
    }
  },

  // DELETE /api/notes/:id
  async delete(req, res, next) {
    try {
      const id = parseInt(req.params.id)
      const deletedNote = await noteService.delete(id)

      if (!deletedNote) {
        return res.status(404).json({
          success: false,
          error: '找不到筆記'
        })
      }

      res.json({
        success: true,
        message: '筆記已刪除',
        data: deletedNote
      })
    } catch (error) {
      next(error)
    }
  }
}
```

---

## Route 層：定義路徑

### src/routes/users.js

```javascript
import { Router } from 'express'
import { userController } from '../controllers/userController.js'

const router = Router()

// 注意：/stats 要放在 /:id 之前，否則 stats 會被當成 id！
router.get('/', userController.getAll)
router.get('/stats', userController.getStats)
router.get('/:id', userController.getById)
router.get('/:id/notes', userController.getWithNotes)
router.post('/', userController.create)
router.put('/:id', userController.update)
router.delete('/:id', userController.delete)

export default router
```

### src/routes/notes.js

```javascript
import { Router } from 'express'
import { noteController } from '../controllers/noteController.js'

const router = Router()

router.get('/', noteController.getAll)
router.get('/:id', noteController.getById)
router.post('/', noteController.create)
router.put('/:id', noteController.update)
router.delete('/:id', noteController.delete)

export default router
```

### src/routes/index.js

```javascript
import { Router } from 'express'
import usersRouter from './users.js'
import notesRouter from './notes.js'

const router = Router()

router.use('/users', usersRouter)
router.use('/notes', notesRouter)

export default router
```

---

## Middleware：錯誤處理

### src/middleware/errorHandler.js

```javascript
// 統一錯誤處理
export function errorHandler(err, req, res, next) {
  console.error('錯誤發生：', err.message)

  const statusCode = err.statusCode || 500
  const message = err.message || '伺服器內部錯誤'

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

// 404 處理
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `找不到路徑: ${req.method} ${req.originalUrl}`
  })
}
```

---

## 應用程式入口

### src/app.js

```javascript
import express from 'express'
import cors from 'cors'
import routes from './routes/index.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

const app = express()

// 跨來源資源共享（讓前端可以呼叫此 API）
app.use(cors())

// 內建中間件
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API 路由
app.use('/api', routes)

// 首頁
app.get('/', (req, res) => {
  res.json({
    message: 'Notes API v2',
    version: '2.0.0',
    endpoints: {
      users: '/api/users',
      notes: '/api/notes'
    }
  })
})

// 錯誤處理（放在最後！）
app.use(notFoundHandler)
app.use(errorHandler)

export default app
```

### index.js（專案根目錄）

```javascript
import app from './src/app.js'
import config from './src/config/index.js'

app.listen(config.port, () => {
  console.log(`伺服器啟動於 http://localhost:${config.port}`)
  console.log(`環境: ${config.nodeEnv}`)
})
```

---

## API 文件

### Users API

#### GET /api/users

取得所有使用者。

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "小明",
      "email": "ming@example.com",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

#### GET /api/users/stats

取得所有使用者及其筆記數量。

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "小明",
      "email": "ming@example.com",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "noteCount": 3
    }
  ]
}
```

#### GET /api/users/:id

取得單一使用者。

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "小明",
    "email": "ming@example.com",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

#### GET /api/users/:id/notes

取得使用者及其所有筆記。

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "小明",
    "email": "ming@example.com",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "notes": [
      {
        "id": 1,
        "title": "我的第一則筆記",
        "content": "...",
        "userId": 1,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

#### POST /api/users

建立新使用者。

**Request Body:**

```json
{
  "name": "小明",
  "email": "ming@example.com"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "小明",
    "email": "ming@example.com",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

#### PUT /api/users/:id

更新使用者。

**Request Body:**

```json
{
  "name": "王小明",
  "email": "wang.ming@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "王小明",
    "email": "wang.ming@example.com",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

#### DELETE /api/users/:id

刪除使用者（同時刪除其所有筆記）。

**Response:**

```json
{
  "success": true,
  "message": "使用者已刪除",
  "data": { ... }
}
```

---

### Notes API

#### GET /api/notes

取得所有筆記（含作者資訊）。

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "我的第一則筆記",
      "content": "...",
      "userId": 1,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "author": {
        "id": 1,
        "name": "小明",
        "email": "ming@example.com"
      }
    }
  ]
}
```

#### GET /api/notes/:id

取得單一筆記（含作者資訊）。

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "我的第一則筆記",
    "content": "...",
    "userId": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "author": {
      "id": 1,
      "name": "小明",
      "email": "ming@example.com"
    }
  }
}
```

#### POST /api/notes

建立新筆記。

**Request Body:**

```json
{
  "title": "學習 Drizzle ORM",
  "content": "Drizzle 是一個輕量級的 ORM...",
  "userId": 1
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": 2,
    "title": "學習 Drizzle ORM",
    "content": "Drizzle 是一個輕量級的 ORM...",
    "userId": 1,
    "createdAt": "2024-01-15T11:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

#### PUT /api/notes/:id

更新筆記。

**Request Body:**

```json
{
  "title": "新標題",
  "content": "新內容..."
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 2,
    "title": "新標題",
    "content": "新內容...",
    "userId": 1,
    "createdAt": "2024-01-15T11:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

#### DELETE /api/notes/:id

刪除筆記。

**Response:**

```json
{
  "success": true,
  "message": "筆記已刪除",
  "data": { ... }
}
```

---

## 測試 API

使用 curl 測試 API：

### 建立使用者

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "小明", "email": "ming@example.com"}'
```

### 取得所有使用者

```bash
curl http://localhost:3000/api/users
```

### 取得使用者統計

```bash
curl http://localhost:3000/api/users/stats
```

### 建立筆記

```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title": "我的第一則筆記", "content": "Hello World!", "userId": 1}'
```

### 取得使用者及其筆記

```bash
curl http://localhost:3000/api/users/1/notes
```

### 取得所有筆記

```bash
curl http://localhost:3000/api/notes
```

---

## 分層架構的好處

| 好處 | 說明 |
|------|------|
| **可測試** | 可以單獨測試 Service，不用管 HTTP |
| **可重複使用** | 多個 Controller 可以共用同一個 Service |
| **容易維護** | 找問題時知道要去哪一層看 |
| **替換容易** | 想換資料庫？只改 Service 就好 |
| **職責分明** | 每層只做自己的事 |

### 資料流向

```
Request → Route → Controller → Service → Database
                      ↓
Response ← Controller ← Service ← Database
```

---

## 延伸練習

完成基本功能後，可以嘗試：

1. **新增分頁**：GET /api/notes?page=1&limit=10
2. **新增搜尋**：GET /api/notes?search=keyword
3. **新增排序**：GET /api/notes?sort=createdAt&order=desc
4. **輸入驗證**：使用驗證中間件確保資料格式
5. **加入 Tags**：新增 tags 表，實作多對多關聯

---

## 恭喜！

你已經完成了 PostgreSQL 與 Drizzle ORM 的學習！

你學會了：
- ✅ SQL 基礎概念和 CRUD 操作
- ✅ PostgreSQL 的安裝和使用
- ✅ Drizzle ORM 的設定和 Schema 定義
- ✅ Migration 資料庫遷移
- ✅ Drizzle 的 CRUD 操作
- ✅ 關聯定義和 Query API
- ✅ 分層架構（Service → Controller → Route）
- ✅ 完整的 API 實作

下一步可以學習：
- JWT 認證（08-jwt）
- OAuth 登入（09-oauth）
- 檔案上傳到 S3（06-upload-to-s3）
