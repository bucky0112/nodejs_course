# Drizzle CRUD 操作

這一章會介紹 Drizzle 的 CRUD 操作。

每個範例都會展示 **Drizzle 語法** 和 **對應的 SQL**，讓你理解 ORM 背後的原理。

---

## 準備工作

### 匯入必要模組

```javascript
import db from './src/config/database.js'
import { usersTable, notesTable } from './src/db/schema.js'
import { eq, ne, gt, lt, gte, lte, like, and, or, inArray, desc, asc } from 'drizzle-orm'
```

---

## SELECT：查詢資料

### 查詢所有資料

```javascript
// Drizzle
const users = await db.select().from(usersTable)

// 對應 SQL
// SELECT * FROM users
```

### 查詢特定欄位

```javascript
// Drizzle
const users = await db
  .select({
    id: usersTable.id,
    name: usersTable.name
  })
  .from(usersTable)

// 對應 SQL
// SELECT id, name FROM users
```

### 查詢單筆資料

```javascript
// Drizzle
const user = await db
  .select()
  .from(usersTable)
  .where(eq(usersTable.id, 1))

// 對應 SQL
// SELECT * FROM users WHERE id = 1

// 注意：回傳的是陣列，取第一筆
const singleUser = user[0]
```

---

## INSERT：新增資料

### 新增單筆資料

```javascript
// Drizzle
await db.insert(usersTable).values({
  name: '小明',
  email: 'ming@example.com'
})

// 對應 SQL
// INSERT INTO users (name, email) VALUES ('小明', 'ming@example.com')
```

### 新增並回傳結果

```javascript
// Drizzle
const newUser = await db
  .insert(usersTable)
  .values({
    name: '小華',
    email: 'hua@example.com'
  })
  .returning()

// 對應 SQL
// INSERT INTO users (name, email) VALUES ('小華', 'hua@example.com') RETURNING *

console.log(newUser[0])
// { id: 2, name: '小華', email: 'hua@example.com', createdAt: ... }
```

### 新增多筆資料

```javascript
// Drizzle
await db.insert(usersTable).values([
  { name: '小美', email: 'mei@example.com' },
  { name: '小強', email: 'qiang@example.com' }
])

// 對應 SQL
// INSERT INTO users (name, email) VALUES
//   ('小美', 'mei@example.com'),
//   ('小強', 'qiang@example.com')
```

---

## UPDATE：更新資料

### 更新單筆資料

```javascript
// Drizzle
await db
  .update(usersTable)
  .set({ name: '王小明' })
  .where(eq(usersTable.id, 1))

// 對應 SQL
// UPDATE users SET name = '王小明' WHERE id = 1
```

### 更新多個欄位

```javascript
// Drizzle
await db
  .update(usersTable)
  .set({
    name: '王小華',
    email: 'wang.hua@example.com'
  })
  .where(eq(usersTable.id, 2))

// 對應 SQL
// UPDATE users SET name = '王小華', email = 'wang.hua@example.com' WHERE id = 2
```

### 更新並回傳結果

```javascript
// Drizzle
const updated = await db
  .update(usersTable)
  .set({ name: '新名字' })
  .where(eq(usersTable.id, 1))
  .returning()

// 對應 SQL
// UPDATE users SET name = '新名字' WHERE id = 1 RETURNING *

console.log(updated[0])
// { id: 1, name: '新名字', email: 'ming@example.com', ... }
```

### 危險警告：沒有 WHERE

```javascript
// 這會更新所有使用者！
await db
  .update(usersTable)
  .set({ name: '路人甲' })
// 沒有 .where()！

// 對應 SQL
// UPDATE users SET name = '路人甲'
// 結果：所有使用者的名字都變成「路人甲」
```

> 💡 **最佳實踐**：永遠先用 `select` 確認要更新的資料，再執行 `update`。

---

## DELETE：刪除資料

### 刪除單筆資料

```javascript
// Drizzle
await db
  .delete(usersTable)
  .where(eq(usersTable.id, 5))

// 對應 SQL
// DELETE FROM users WHERE id = 5
```

### 刪除並回傳結果

```javascript
// Drizzle
const deleted = await db
  .delete(usersTable)
  .where(eq(usersTable.id, 5))
  .returning()

// 對應 SQL
// DELETE FROM users WHERE id = 5 RETURNING *

console.log(deleted[0])
// { id: 5, name: '小偉', ... }
```

### 危險警告：沒有 WHERE

```javascript
// 這會刪除所有使用者！
await db.delete(usersTable)
// 沒有 .where()！

// 對應 SQL
// DELETE FROM users
// 結果：整張表的資料全部消失
```

---

## 條件運算子

Drizzle 提供了各種運算子來建立查詢條件。

### 匯入運算子

```javascript
import {
  eq,      // 等於
  ne,      // 不等於
  gt,      // 大於
  lt,      // 小於
  gte,     // 大於等於
  lte,     // 小於等於
  like,    // 模糊比對
  ilike,   // 不區分大小寫的模糊比對
  and,     // 且
  or,      // 或
  not,     // 否
  inArray, // 在陣列中
  isNull,  // 為空
  isNotNull // 非空
} from 'drizzle-orm'
```

### 比較運算子

```javascript
// 等於
.where(eq(usersTable.id, 1))
// WHERE id = 1

// 不等於
.where(ne(usersTable.status, 'deleted'))
// WHERE status != 'deleted'

// 大於
.where(gt(usersTable.age, 18))
// WHERE age > 18

// 小於
.where(lt(notesTable.id, 100))
// WHERE id < 100

// 大於等於
.where(gte(usersTable.age, 18))
// WHERE age >= 18

// 小於等於
.where(lte(notesTable.id, 100))
// WHERE id <= 100
```

### 邏輯運算子

```javascript
// AND：同時滿足
.where(
  and(
    eq(usersTable.isActive, true),
    gt(usersTable.age, 18)
  )
)
// WHERE is_active = true AND age > 18

// OR：滿足其一
.where(
  or(
    eq(usersTable.name, '小明'),
    eq(usersTable.name, '小華')
  )
)
// WHERE name = '小明' OR name = '小華'

// 複合條件
.where(
  and(
    eq(usersTable.isActive, true),
    or(
      eq(usersTable.role, 'admin'),
      eq(usersTable.role, 'editor')
    )
  )
)
// WHERE is_active = true AND (role = 'admin' OR role = 'editor')
```

### 特殊運算子

```javascript
// LIKE：模糊比對
.where(like(notesTable.title, '%學習%'))
// WHERE title LIKE '%學習%'

// IN：在清單中
.where(inArray(usersTable.id, [1, 2, 3]))
// WHERE id IN (1, 2, 3)

// IS NULL
.where(isNull(notesTable.content))
// WHERE content IS NULL

// IS NOT NULL
.where(isNotNull(notesTable.content))
// WHERE content IS NOT NULL
```

---

## 排序與分頁

### 排序 (ORDER BY)

```javascript
import { desc, asc } from 'drizzle-orm'

// 降冪排序（最新的在前面）
const notes = await db
  .select()
  .from(notesTable)
  .orderBy(desc(notesTable.createdAt))

// 對應 SQL
// SELECT * FROM notes ORDER BY created_at DESC

// 升冪排序
.orderBy(asc(usersTable.name))
// ORDER BY name ASC

// 多欄位排序
.orderBy(desc(usersTable.isActive), asc(usersTable.name))
// ORDER BY is_active DESC, name ASC
```

### 分頁 (LIMIT / OFFSET)

```javascript
// 取前 10 筆
const notes = await db
  .select()
  .from(notesTable)
  .limit(10)

// 對應 SQL
// SELECT * FROM notes LIMIT 10

// 第 2 頁（跳過前 10 筆，取接下來 10 筆）
const page2 = await db
  .select()
  .from(notesTable)
  .orderBy(desc(notesTable.createdAt))
  .limit(10)
  .offset(10)

// 對應 SQL
// SELECT * FROM notes ORDER BY created_at DESC LIMIT 10 OFFSET 10
```

### 分頁公式

```javascript
// page 從 1 開始
// limit 是每頁筆數
function paginate(page, limit) {
  const offset = (page - 1) * limit
  return { limit, offset }
}

// 使用
const { limit, offset } = paginate(3, 10)  // 第 3 頁，每頁 10 筆
const notes = await db
  .select()
  .from(notesTable)
  .orderBy(desc(notesTable.createdAt))
  .limit(limit)
  .offset(offset)
```

---

## 分層架構：Service + Controller + Route

在上一章，我們介紹了分層架構。現在來看 CRUD 如何分層：

### 1. Service 層：資料庫操作

Service 層負責所有 Drizzle 操作，是「真正做事」的地方。

```javascript
// src/services/userService.js
import db from '../config/database.js'
import { usersTable } from '../db/schema.js'
import { eq } from 'drizzle-orm'

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

### 2. Controller 層：處理請求回應

Controller 負責接收請求、呼叫 Service、回傳回應。

```javascript
// src/controllers/userController.js
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

      res.json({ success: true, message: '使用者已刪除' })
    } catch (error) {
      next(error)
    }
  }
}
```

### 3. Route 層：定義路徑

Route 只負責定義 URL 路徑和對應的 Controller。

```javascript
// src/routes/users.js
import { Router } from 'express'
import { userController } from '../controllers/userController.js'

const router = Router()

router.get('/', userController.getAll)
router.get('/:id', userController.getById)
router.post('/', userController.create)
router.put('/:id', userController.update)
router.delete('/:id', userController.delete)

export default router
```

### 4. 註冊路由

```javascript
// src/routes/index.js
import { Router } from 'express'
import usersRouter from './users.js'

const router = Router()

router.use('/users', usersRouter)

export default router
```

### 分層的好處

| 好處 | 說明 |
|------|------|
| **可測試** | 可以單獨測試 Service，不用管 HTTP |
| **可重複使用** | 多個 Controller 可以共用同一個 Service |
| **容易維護** | 找問題時知道要去哪一層看 |
| **替換容易** | 想換資料庫？只改 Service 就好 |

---

## Drizzle vs SQL 對照表

| 操作 | Drizzle | SQL |
|------|---------|-----|
| 查詢全部 | `db.select().from(table)` | `SELECT * FROM table` |
| 條件查詢 | `.where(eq(col, val))` | `WHERE col = val` |
| 新增 | `db.insert(table).values({})` | `INSERT INTO table VALUES` |
| 更新 | `db.update(table).set({}).where()` | `UPDATE table SET ... WHERE` |
| 刪除 | `db.delete(table).where()` | `DELETE FROM table WHERE` |
| 回傳結果 | `.returning()` | `RETURNING *` |
| 排序 | `.orderBy(desc(col))` | `ORDER BY col DESC` |
| 分頁 | `.limit(n).offset(m)` | `LIMIT n OFFSET m` |

---

## 重點回顧

| 操作 | Drizzle 語法 |
|------|-------------|
| 查詢 | `db.select().from(table).where()` |
| 新增 | `db.insert(table).values({}).returning()` |
| 更新 | `db.update(table).set({}).where().returning()` |
| 刪除 | `db.delete(table).where().returning()` |

### 分層架構

| 層級 | 職責 |
|------|------|
| Service | Drizzle 操作、業務邏輯 |
| Controller | 接收請求、呼叫 Service、回傳回應 |
| Route | 定義 URL 路徑 |

### 黃金法則

1. **UPDATE 和 DELETE 一定要有 .where()**
2. **使用 .returning() 確認操作結果**
3. **Service 處理資料，Controller 處理 HTTP**

---

## 下一章

目前我們的查詢都是針對單一表格。

下一章會學習如何使用 Drizzle 進行 **關聯查詢**：
- 定義表格間的關聯
- 使用 Query API 進行巢狀查詢
- 比較 Query API 和 leftJoin 的差異
