# 概念卡：ORM 是什麼（為什麼用 Prisma）

> 一句話：ORM 是「幫你用 JavaScript 操作資料庫」的工具。你操作物件與函式，它在背後產生並執行 SQL。

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

能用，但有幾個痛點：手寫字串容易打錯、沒有自動補全、回傳的資料長什麼樣要自己記、改 schema 時沒人提醒你哪些查詢要跟著改。

---

## 二、用 Prisma 之後

```js
const todos = await prisma.todo.findMany({
  where: { completed: false },
  orderBy: { id: 'asc' },
})
```

差別：
- **自動補全**：`prisma.todo`、`completed` 都是編輯器認得的東西，打錯欄位名稱會被提示。
- **schema 是單一事實來源**：表結構寫一次（在 `schema.prisma`），Prisma Client、migration 都從它產生。
- **產生的就是普通 SQL**：Prisma 不是魔法，它產生的 SQL 就是你在[第 9 堂](../09-postgresql-basics/)手寫的那些。

> 這就是為什麼本課程先教 SQL 再教 ORM：你看得懂它產生什麼，才用得安心。

---

## 三、為什麼選 Prisma

Node.js 常見的 ORM 有 Prisma、Drizzle、TypeORM、Sequelize。本課程選 Prisma 因為：

- **schema 好讀**：`schema.prisma` 一眼就看得出有哪些表、欄位和關聯。
- **查詢 API 一致**：`findMany`、`create`、`update`、`delete` 對每個 model 都一樣，關聯用 `include` 一起撈。
- **會產生型別**：Prisma Client 帶有完整的型別資訊，之後用 TypeScript 或 Next.js 時，資料庫的型別可以一路傳到前端。

取捨：Prisma 的查詢語法不是 SQL，複雜查詢有時要查文件或改寫成原生 SQL（`prisma.$queryRaw`）。

> 沒有「最好的 ORM」，只有適合情境的。重點是理解 ORM 的共通概念，換工具時道理一樣。

---

## 四、核心三件套

用 Prisma（或多數 ORM）操作資料庫，你會碰到三樣東西：

1. **Schema**：用 `schema.prisma` 定義表長什麼樣（`model Todo { ... }`）。
2. **Client**：`prisma generate` 產生的查詢工具，在程式裡建立一個共用的 `prisma` 物件。
3. **Migration**：把 schema 的「變更」變成可重播的 SQL 檔，套用到資料庫。→ [概念卡：migration](./migration.md)

---

## 延伸
- 撈關聯資料用 `include`，例如 `prisma.todo.findMany({ include: { list: true } })`，[第 12 堂](../12-prisma-relations-integration/)會用到。→ [概念卡：Prisma 關聯查詢](./prisma-關聯查詢.md)
- 關聯查詢的底層仍是 JOIN，[概念卡：SQL 關聯與 JOIN](./sql-關聯與join.md) 的知識照樣用得上。
