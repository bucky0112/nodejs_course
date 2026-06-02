# Drizzle ORM 安裝與設定

## 回顧：手動寫 SQL 的痛點

在第 3 章的 SQL 教學與上一節的回顧中，你應該已經體驗到手動操作 SQL 的「痛苦」：

| 痛點 | 說明 |
|------|------|
| 容易打錯語法 | 忘記分號、拼錯關鍵字 |
| 字串拼接麻煩 | 動態產生 SQL 很容易出錯 |
| SQL Injection 風險 | 使用者輸入可能被當成 SQL 執行 |
| 沒有自動補全 | 要記住所有表格和欄位名稱 |
| 難以維護 | SQL 散落在各處，難以統一管理 |
| 沒有版本控制 | 資料庫結構變更無法追蹤 |

**這就是為什麼我們需要 ORM！**

---

## 什麼是 ORM？

**ORM** = Object-Relational Mapping（物件關聯映射）

簡單來說，ORM 讓你可以用程式語言的物件來操作資料庫，而不需要直接寫 SQL。

### 沒有 ORM 時

```javascript
// 手動拼接 SQL (危險！)
const sql = `SELECT * FROM users WHERE id = ${userId}`;
await pool.query(sql);
```

### 使用 ORM 時

```javascript
// 使用 Drizzle ORM (安全、簡潔)
await db.select().from(users).where(eq(users.id, userId));
```

---

## 為什麼選擇 Drizzle？

市面上有很多 JavaScript ORM，常見的有：

| ORM | 特點 |
|-----|------|
| **Drizzle** | 輕量、SQL-like 語法、現代化 |
| Prisma | 功能強大，但較重、有自己的語法 |
| Sequelize | 歷史悠久，但語法較舊 |
| TypeORM | 適合 TypeScript，但較複雜 |

### Drizzle 的優勢

1. **SQL-like 語法**：學過 SQL 的人很容易上手
2. **輕量級**：沒有額外的 runtime，效能好
3. **型別安全**：即使用 JavaScript 也有良好的 IDE 提示
4. **內建 Migration**：Drizzle Kit 讓資料庫版本控制變簡單

```javascript
// Drizzle 的語法跟 SQL 很像！
db.select().from(users).where(eq(users.id, 1))
// 對應 SQL: SELECT * FROM users WHERE id = 1
```

---

## 安裝套件

### 1. 初始化專案

```bash
# 建立專案資料夾
mkdir notes-api
cd notes-api

# 初始化 Node.js 專案
npm init -y
```

### 2. 安裝所需套件

```bash
# 主要套件
npm install express drizzle-orm pg dotenv

# 開發工具
npm install -D drizzle-kit nodemon
```

| 套件 | 說明 |
|------|------|
| `express` | Web 框架 |
| `drizzle-orm` | Drizzle ORM 核心 |
| `pg` | PostgreSQL 驅動程式 |
| `dotenv` | 環境變數管理 |
| `drizzle-kit` | CLI 工具（生成 Migration） |
| `nodemon` | 開發時自動重啟 |

### 3. 設定 package.json

```json
{
  "name": "notes-api",
  "type": "module",
  "scripts": {
    "dev": "nodemon index.js",
    "start": "node index.js",
    "generate": "drizzle-kit generate",
    "migrate": "drizzle-kit migrate",
    "push": "drizzle-kit push",
    "studio": "drizzle-kit studio"
  }
}
```

> 💡 注意 `"type": "module"`：這讓我們可以使用 ESM（`import/export`）語法。

---

## 專案結構

我們採用**分層架構**，讓程式碼更有組織、更容易維護：

```
notes-api/
├── package.json
├── drizzle.config.js       # Drizzle Kit 設定
├── index.js                # 應用程式入口（很簡短）
├── .env                    # 環境變數（不要 commit！）
├── .env.template           # 環境變數範本
│
├── src/
│   ├── app.js              # Express 應用設定
│   │
│   ├── config/             # 環境設定
│   │   ├── index.js        # 環境變數統一管理
│   │   └── database.js     # 資料庫連線
│   │
│   ├── db/                 # 資料庫相關
│   │   └── schema.js       # Drizzle Schema 定義
│   │
│   ├── middleware/         # 中間件
│   │   └── errorHandler.js
│   │
│   ├── controllers/        # 控制器
│   │   ├── userController.js
│   │   └── noteController.js
│   │
│   ├── services/           # 服務層（業務邏輯）
│   │   ├── userService.js
│   │   └── noteService.js
│   │
│   └── routes/             # 路由定義
│       ├── index.js
│       ├── users.js
│       └── notes.js
│
└── drizzle/                # Migration 檔案（自動生成）
```

### 每層的職責

| 層級 | 職責 | 說明 |
|------|------|------|
| `config/` | 環境設定 | 統一管理環境變數、資料庫連線 |
| `db/` | Schema 定義 | Drizzle 資料表結構 |
| `routes/` | 路由 | 定義 URL 路徑 |
| `controllers/` | 控制器 | 接收請求、回傳回應 |
| `services/` | 服務層 | 業務邏輯、資料庫操作 |
| `middleware/` | 中間件 | 錯誤處理、驗證等 |

### 建立資料夾結構

```bash
mkdir -p src/{config,db,middleware,controllers,services,routes}
```

---

## 環境變數設定

### .env.template（可以 commit）

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

### .env（不要 commit！）

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/notes_app
```

> ⚠️ 請將 `.env` 加入 `.gitignore`，避免密碼外洩！

---

## config/ - 環境設定層

### src/config/index.js

集中管理所有環境變數，其他檔案只需引用這裡：

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

**好處**：
- 所有設定集中一處，不用到處找 `process.env.XXX`
- 可以設定預設值
- 容易看出專案需要哪些環境變數

### src/config/database.js

資料庫連線設定，這是 Drizzle 的核心：

```javascript
import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import config from './index.js'
import * as schema from '../db/schema.js'

const { Pool } = pg

// 建立連線池
const pool = new Pool({
  connectionString: config.databaseUrl
})

// 建立 Drizzle 客戶端，並傳入 schema
const db = drizzle(pool, { schema })

export default db
```

### 連線池 (Pool) 概念

為什麼需要連線池？

- 建立資料庫連線需要時間
- 頻繁開關連線會影響效能
- 連線池預先建立連線，需要時直接使用

### 為什麼要傳入 schema？

傳入 `schema` 可以讓 Drizzle 的 Query API 知道表格間的關聯，
這樣就可以使用 `db.query.users.findMany({ with: { notes: true } })` 這種語法。

---

## db/ - Schema 定義

Schema 是你用程式碼定義資料庫結構的地方。

### src/db/schema.js

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

### 資料型別對應

| PostgreSQL | Drizzle | 說明 |
|------------|---------|------|
| `SERIAL` | `serial()` | 自動遞增整數 |
| `INTEGER` | `integer()` | 整數 |
| `VARCHAR(n)` | `varchar({ length: n })` | 可變長度字串 |
| `TEXT` | `text()` | 無限長度文字 |
| `BOOLEAN` | `boolean()` | 布林值 |
| `TIMESTAMP` | `timestamp()` | 時間戳 |

### 約束方法

| SQL 約束 | Drizzle 方法 |
|----------|--------------|
| `PRIMARY KEY` | `.primaryKey()` |
| `NOT NULL` | `.notNull()` |
| `UNIQUE` | `.unique()` |
| `DEFAULT value` | `.default(value)` |
| `DEFAULT NOW()` | `.defaultNow()` |
| `REFERENCES` | `.references(() => table.column)` |

### 欄位命名：camelCase vs snake_case

```javascript
// JavaScript 中用 camelCase
userId: integer("user_id")  // 資料庫中用 snake_case

createdAt: timestamp("created_at")
```

這樣可以讓 JavaScript 程式碼保持 camelCase 風格，同時資料庫保持 snake_case 慣例。

---

## Drizzle Kit 設定

### drizzle.config.js（專案根目錄）

```javascript
import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  // Migration 輸出目錄
  out: './drizzle',

  // Schema 檔案位置（注意路徑！）
  schema: './src/db/schema.js',

  // 使用 PostgreSQL
  dialect: 'postgresql',

  // 資料庫連線設定
  dbCredentials: {
    url: process.env.DATABASE_URL
  }
})
```

> 💡 注意 `schema` 路徑改成 `./src/db/schema.js`

---

## middleware/ - 錯誤處理

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
import routes from './routes/index.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

const app = express()

// 內建中間件
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API 路由
app.use('/api', routes)

// 首頁
app.get('/', (req, res) => {
  res.json({
    message: 'Notes API',
    version: '1.0.0'
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

### src/routes/index.js（暫時空路由）

```javascript
import { Router } from 'express'

const router = Router()

// 之後會加入 users 和 notes 路由

export default router
```

---

## 驗證設定

### 1. 確認資料庫存在

在 pgAdmin 或終端機中建立資料庫：

```sql
CREATE DATABASE notes_app;
```

### 2. 測試連線

建立一個簡單的測試檔案：

```javascript
// test-connection.js
import db from './src/config/database.js'
import { usersTable } from './src/db/schema.js'

async function test() {
  try {
    const result = await db.select().from(usersTable)
    console.log('連線成功！', result)
  } catch (error) {
    if (error.message.includes('does not exist')) {
      console.log('連線成功！但表格尚未建立，請執行 Migration。')
    } else {
      console.error('連線失敗：', error.message)
    }
  }
  process.exit(0)
}

test()
```

執行：

```bash
node test-connection.js
```

---

## 重點回顧

| 概念 | 重點 |
|------|------|
| ORM | 用程式物件操作資料庫，不用手寫 SQL |
| Drizzle | 輕量、SQL-like 語法的現代 ORM |
| 分層架構 | config → db → services → controllers → routes |
| Schema | 用程式碼定義資料庫結構 |
| Pool | 連線池，提高資料庫連線效能 |

### 必備檔案

| 檔案 | 用途 |
|------|------|
| `src/db/schema.js` | 定義資料表結構 |
| `src/config/database.js` | 資料庫連線 |
| `src/config/index.js` | 環境變數管理 |
| `drizzle.config.js` | Drizzle Kit 設定 |
| `.env` | 資料庫連線字串 |

---

## 下一章

設定完成後，我們需要把 Schema「同步」到實際的資料庫中。

這就是 **Migration（資料庫遷移）** 的功能！

下一章我們會學習：
- 為什麼需要 Migration
- Drizzle Kit 指令
- 完整的 Migration 工作流程
