# 概念卡：ORM 是什麼（為什麼用 Drizzle）

> 一句話：ORM 是「幫你用 JavaScript 寫 SQL」的工具。你操作物件與函式，它在背後產生並執行 SQL。

---

## 一、沒有 ORM 的時候

直接用 `pg` 套件，你得自己拼 SQL 字串：

```js
const result = await pool.query(
  'SELECT * FROM todos WHERE completed = $1 ORDER BY id',
  [false]
)
const todos = result.rows
```

能用，但有幾個痛點：手寫字串容易打錯、沒有自動補全、回傳型別不明、改 schema 時沒人提醒你哪些查詢要跟著改。

---

## 二、用 Drizzle 之後

```js
const todos = await db
  .select()
  .from(todosTable)
  .where(eq(todosTable.completed, false))
  .orderBy(todosTable.id)
```

差別：
- **自動補全 + 型別**：`todosTable.completed` 是 IDE 認得的東西，打錯會被抓出來。
- **schema 是單一事實來源**：表結構寫一次（在 schema.js），查詢、migration 都從它衍生。
- **產生的就是普通 SQL**：Drizzle 不是魔法，它產生的 SQL 就是你在 [S1] 手寫的那些。

> 這就是為什麼本課程先教 SQL 再教 ORM——你看得懂它產生什麼，才用得安心。

---

## 三、為什麼選 Drizzle（而不是別的 ORM）

Node.js 常見的 ORM 有 Prisma、TypeORM、Sequelize、Drizzle。本課程選 Drizzle 因為：

- **薄、貼近 SQL**：API 幾乎是 SQL 的一對一對應，學了 SQL 的人馬上會用，也不會把底層藏太深。
- **schema 用純 JS/TS 定義**，不需要學另一套 schema 語言。
- **輕量、無額外執行期引擎**，適合搭配 Express。

> 沒有「最好的 ORM」，只有適合情境的。重點是理解 ORM 的共通概念，換工具時道理一樣。

---

## 四、核心三件套

用 Drizzle（或多數 ORM）操作資料庫，你會碰到三樣東西：

1. **Schema**：用程式碼定義表長什麼樣（`pgTable(...)`）。
2. **Client / 連線**：建立到資料庫的連線池，得到一個 `db` 物件。
3. **Migration**：把 schema 的「變更」變成可重播的 SQL 檔，套用到資料庫。→ [概念卡：Drizzle Migration](./drizzle-migration.md)

---

## 延伸
- Drizzle 還有一套「Query API」(`db.query.todos.findMany({ with: { ... } })`)，特別適合撈關聯資料，[M3] 會用到。
- 操作關聯查詢時，底層仍是 JOIN——[概念卡：SQL 關聯與 JOIN](./sql-關聯與join.md) 的知識照樣用得上。
