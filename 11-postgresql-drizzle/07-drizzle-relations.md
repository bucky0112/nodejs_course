# Drizzle 關聯定義與查詢

這一章會介紹 Drizzle 中最強大的功能之一：**關聯查詢**。

你會學到：
- 如何定義表格間的關聯
- 使用 Query API 進行巢狀查詢
- 比較 Query API 和 leftJoin 的差異
- 體驗自動結構化回傳的便利

---

## 回顧：SQL 的 JOIN

在 SQL 中，我們用 JOIN 來合併多張表格的資料：

```sql
SELECT users.*, notes.*
FROM users
LEFT JOIN notes ON users.id = notes.user_id;
```

回傳的是「扁平」結構：

```
┌────┬──────┬────┬──────────────┬─────────┐
│ id │ name │ id │ title        │ user_id │
├────┼──────┼────┼──────────────┼─────────┤
│ 1  │ 小明 │ 1  │ 我的第一則筆記 │ 1       │
│ 2  │ 小華 │ 2  │ 學習 SQL      │ 2       │
│ 2  │ 小華 │ 3  │ 學習 Node.js  │ 2       │
│ 3  │ 小美 │ NULL│ NULL         │ NULL    │
└────┴──────┴────┴──────────────┴─────────┘
```

問題：
- 資料是扁平的，不符合 JavaScript 物件的習慣
- 需要自己組裝成巢狀結構
- 欄位名稱可能重複（兩個 `id`）

---

## Drizzle 的解決方案

Drizzle 提供兩種方式處理關聯查詢：

| 方式 | 說明 | 回傳格式 |
|------|------|----------|
| **Query API** | 自動巢狀查詢 | 巢狀 JSON |
| **leftJoin** | 傳統 SQL JOIN | 扁平結構 |

---

## 定義 Relations

要使用 Query API，必須先在 schema 中定義 Relations。

### 完整的 schema.js

```javascript
// src/db/schema.js
import { pgTable, serial, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ============ 表格定義 ============

export const usersTable = pgTable("users", {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow()
})

export const notesTable = pgTable("notes", {
  id: serial().primaryKey(),
  title: varchar({ length: 255 }).notNull(),
  content: text(),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
})

// ============ 關聯定義 ============

// 一個 User 有多則 Notes (One-to-Many)
export const usersRelations = relations(usersTable, ({ many }) => ({
  notes: many(notesTable)
}))

// 一則 Note 屬於一個 User (Many-to-One)
export const notesRelations = relations(notesTable, ({ one }) => ({
  author: one(usersTable, {
    fields: [notesTable.userId],    // Note 的外鍵欄位
    references: [usersTable.id]      // User 的主鍵欄位
  })
}))
```

### 關聯類型

| 類型 | 函數 | 說明 |
|------|------|------|
| One-to-Many | `many()` | 一對多（User → Notes） |
| Many-to-One | `one()` | 多對一（Note → User） |

### 注意事項

1. **Relations 是雙向的**：如果 User 有 `notes`，Note 也應該有 `author`
2. **外鍵欄位 vs Relations**：`references()` 定義資料庫的外鍵約束，`relations()` 定義查詢時的關聯

---

## 設定 Drizzle Client

要使用 Query API，建立 Drizzle Client 時必須傳入 schema：

```javascript
// src/config/database.js
import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import config from './index.js'
import * as schema from '../db/schema.js'  // 匯入整個 schema

const { Pool } = pg

const pool = new Pool({
  connectionString: config.databaseUrl
})

// 傳入 schema！
const db = drizzle(pool, { schema })

export default db
```

---

## Query API：巢狀查詢

### 查詢使用者及其所有筆記

```javascript
const users = await db.query.usersTable.findMany({
  with: {
    notes: true  // 包含關聯的 notes
  }
})
```

**回傳結果**（自動巢狀！）：

```javascript
[
  {
    id: 1,
    name: "小明",
    email: "ming@example.com",
    createdAt: "2024-01-15T10:00:00.000Z",
    notes: [
      {
        id: 1,
        title: "我的第一則筆記",
        content: "...",
        userId: 1,
        createdAt: "2024-01-15T10:30:00.000Z"
      }
    ]
  },
  {
    id: 2,
    name: "小華",
    email: "hua@example.com",
    createdAt: "2024-01-15T11:00:00.000Z",
    notes: [
      {
        id: 2,
        title: "學習 SQL",
        content: "...",
        userId: 2
      },
      {
        id: 3,
        title: "學習 Node.js",
        content: "...",
        userId: 2
      }
    ]
  },
  {
    id: 3,
    name: "小美",
    email: "mei@example.com",
    notes: []  // 沒有筆記的使用者也會出現！
  }
]
```

> 💡 注意：Query API 會自動把關聯資料組成巢狀結構，不需要手動處理！

### 查詢單筆資料

```javascript
const user = await db.query.usersTable.findFirst({
  where: eq(usersTable.id, 1),
  with: {
    notes: true
  }
})
```

### 查詢筆記及其作者

```javascript
const notes = await db.query.notesTable.findMany({
  with: {
    author: true  // 包含關聯的 author
  }
})
```

**回傳結果**：

```javascript
[
  {
    id: 1,
    title: "我的第一則筆記",
    content: "...",
    userId: 1,
    author: {
      id: 1,
      name: "小明",
      email: "ming@example.com"
    }
  },
  // ...
]
```

---

## Query API 進階用法

### 過濾關聯資料

```javascript
// 查詢使用者，只包含標題含「學習」的筆記
const users = await db.query.usersTable.findMany({
  with: {
    notes: {
      where: like(notesTable.title, '%學習%')
    }
  }
})
```

### 排序關聯資料

```javascript
// 查詢使用者，筆記依建立時間降冪排序
const users = await db.query.usersTable.findMany({
  with: {
    notes: {
      orderBy: (notes, { desc }) => [desc(notes.createdAt)]
    }
  }
})
```

### 限制關聯資料筆數

```javascript
// 查詢使用者，只取最新 5 則筆記
const users = await db.query.usersTable.findMany({
  with: {
    notes: {
      orderBy: (notes, { desc }) => [desc(notes.createdAt)],
      limit: 5
    }
  }
})
```

### 選擇特定欄位

```javascript
const users = await db.query.usersTable.findMany({
  columns: {
    id: true,
    name: true
    // 只取 id 和 name
  },
  with: {
    notes: {
      columns: {
        id: true,
        title: true
        // 只取 id 和 title
      }
    }
  }
})
```

---

## leftJoin：傳統方式

如果你需要更複雜的查詢，可以使用傳統的 leftJoin：

```javascript
const result = await db
  .select({
    userId: usersTable.id,
    userName: usersTable.name,
    noteId: notesTable.id,
    noteTitle: notesTable.title
  })
  .from(usersTable)
  .leftJoin(notesTable, eq(usersTable.id, notesTable.userId))
```

**回傳結果**（扁平結構）：

```javascript
[
  { userId: 1, userName: "小明", noteId: 1, noteTitle: "我的第一則筆記" },
  { userId: 2, userName: "小華", noteId: 2, noteTitle: "學習 SQL" },
  { userId: 2, userName: "小華", noteId: 3, noteTitle: "學習 Node.js" },
  { userId: 3, userName: "小美", noteId: null, noteTitle: null }
]
```

---

## Query API vs leftJoin

| 特性 | Query API | leftJoin |
|------|-----------|----------|
| 回傳格式 | 巢狀 JSON | 扁平結構 |
| 使用難度 | 簡單 | 較複雜 |
| 靈活性 | 中等 | 高 |
| 聚合函數 | 不支援 | 支援 |
| 適用場景 | 一般 CRUD API | 複雜報表查詢 |

### 選擇建議

- **Query API**：大部分情況都用這個，簡單又方便
- **leftJoin**：需要聚合函數（COUNT, SUM 等）或複雜查詢時使用

---

## 分層架構：Service 中的關聯查詢

### userService 加入關聯查詢

```javascript
// src/services/userService.js
import db from '../config/database.js'
import { usersTable, notesTable } from '../db/schema.js'
import { eq, count } from 'drizzle-orm'

export const userService = {
  // ... 原有的 CRUD 方法

  // 取得使用者及其筆記
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

  // 取得所有使用者及其筆記數量（使用 leftJoin）
  async findAllWithNoteCount() {
    return await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        noteCount: count(notesTable.id)
      })
      .from(usersTable)
      .leftJoin(notesTable, eq(usersTable.id, notesTable.userId))
      .groupBy(usersTable.id, usersTable.name, usersTable.email)
  }
}
```

### noteService 加入關聯查詢

```javascript
// src/services/noteService.js
import db from '../config/database.js'
import { notesTable } from '../db/schema.js'
import { eq } from 'drizzle-orm'

export const noteService = {
  // ... 原有的 CRUD 方法

  // 取得筆記及其作者
  async findByIdWithAuthor(id) {
    return await db.query.notesTable.findFirst({
      where: eq(notesTable.id, id),
      with: {
        author: true
      }
    })
  },

  // 取得所有筆記及其作者
  async findAllWithAuthor() {
    return await db.query.notesTable.findMany({
      with: {
        author: true
      },
      orderBy: (notes, { desc }) => [desc(notes.createdAt)]
    })
  }
}
```

### Controller 使用 Service

```javascript
// src/controllers/userController.js
import { userService } from '../services/userService.js'

export const userController = {
  // ... 原有的方法

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

  // GET /api/users/stats
  async getStats(req, res, next) {
    try {
      const stats = await userService.findAllWithNoteCount()
      res.json({ success: true, data: stats })
    } catch (error) {
      next(error)
    }
  }
}
```

### 路由定義

```javascript
// src/routes/users.js
import { Router } from 'express'
import { userController } from '../controllers/userController.js'

const router = Router()

router.get('/', userController.getAll)
router.get('/stats', userController.getStats)  // 放在 :id 之前！
router.get('/:id', userController.getById)
router.get('/:id/notes', userController.getWithNotes)
router.post('/', userController.create)
router.put('/:id', userController.update)
router.delete('/:id', userController.delete)

export default router
```

> 💡 注意：`/stats` 要放在 `/:id` 之前，否則 `stats` 會被當成 id！

---

## 重點回顧

### Relations 定義

```javascript
// One-to-Many (User → Notes)
export const usersRelations = relations(usersTable, ({ many }) => ({
  notes: many(notesTable)
}))

// Many-to-One (Note → User)
export const notesRelations = relations(notesTable, ({ one }) => ({
  author: one(usersTable, {
    fields: [notesTable.userId],
    references: [usersTable.id]
  })
}))
```

### Query API

```javascript
// 查詢使用者及其筆記
await db.query.usersTable.findMany({
  with: {
    notes: true
  }
})

// 查詢筆記及其作者
await db.query.notesTable.findMany({
  with: {
    author: true
  }
})
```

### 分層架構

| 層級 | 職責 |
|------|------|
| Service | Query API 和 leftJoin 查詢 |
| Controller | 呼叫 Service、處理回應 |
| Route | 定義 URL 路徑 |

### 選擇建議

| 情境 | 使用 |
|------|------|
| 一般 CRUD API | Query API |
| 需要巢狀 JSON | Query API |
| 聚合函數 (COUNT, SUM) | leftJoin |
| 複雜報表查詢 | leftJoin |

---

## 下一章

恭喜你完成了 Drizzle ORM 的核心概念！

下一章是最終實作：**記事本 API v2**

你會把學到的所有知識整合起來，建立一個完整的 API：
- 完整的分層架構
- User 和 Note 的 Schema
- Migration 流程
- 完整的 CRUD API
- 關聯查詢
