# 第 11 堂 · Prisma 入門：把 todo 存進資料庫

> 對應課綱第 11 堂（schema.prisma、migration、Prisma Client CRUD）。延續第 8 堂的 todo app，資料從記憶體換成 PostgreSQL。

> ⚠️ 第 9–12 堂是新主題，**先不用 AI 工具**。親手學會之後，第 13 堂再把資料層的規則加進規則檔和 AI 協作。

---

## ① 這堂你會做出什麼、搞懂什麼

**做出**：用 Prisma 把 todo app 接上 PostgreSQL，重啟伺服器資料也不會消失。

**搞懂**：
- ORM 是什麼，Prisma 的查詢對應到哪段 SQL
- `schema.prisma` 怎麼描述資料表，`@map` / `@@map` 的用途
- migration 做了什麼、為什麼要 commit
- 為什麼整個 app 只建立一個 Prisma Client
- 為什麼換資料庫只需要改 service

---

## ② 前置檢查

- [ ] **Node.js 22.18 以上**（`node -v` 確認）。Prisma 7 產生的程式碼需要這個版本。
- [ ] 完成[第 9 堂](../09-postgresql-basics/)：PostgreSQL 裝好、`psql` 連得上、會寫基本的 SQL。
- [ ] 完成[第 8 堂](../08-testing-and-validation/)，手上有三層結構的 todo app（或直接複製[第 8 堂完成版](../08-testing-and-validation/完成版/)）。

---

## ③ 工作坊

**→ [開始工作坊](./工作坊.md)**

| 步驟 | 你會做到 | 檢查點 |
|---|---|---|
| 0–1 | 整理專案、建資料庫、設定 `DATABASE_URL` | A |
| 2–4 | 安裝 Prisma、寫 schema、用 migration 建表 | B |
| 5 | 產生 Prisma Client | C |
| 6–7 | 建立共用 client、把 service 換成 Prisma 查詢 | D |
| 8 | 確認資料真的存進資料庫 | E（完成版） |

完成版放在 [`完成版/`](./完成版/)。

---

## ④ 概念卡（想搞懂「為什麼」就點進去）

- [ORM 是什麼](../concepts/orm-是什麼.md)：ORM 和手寫 SQL 的取捨
- [migration](../concepts/migration.md)：為什麼用 migration 管理資料表結構

---

## ⑤ 驗收 + 挑戰

> ✏️ **課堂練習**：做完工作坊後，先試[課堂練習](./課堂練習.md)：自己替 todo 加一個新欄位，走一次「改 schema → migration → 改 service」。

### 驗收：確認你的成果能跑

```bash
cd 完成版
npm install                        # 會自動執行 prisma generate
cp .env.example .env               # 再把 DATABASE_URL 改成你的資料庫
createdb todo_app
npx prisma migrate dev             # 套用 prisma/migrations 裡的 migration
npm run dev
```

逐一確認：

- [ ] `POST /todos` 帶 `{"title":"buy milk"}` 回 201，接著 `GET /todos` 看得到這一筆
- [ ] 重啟伺服器後，資料還在
- [ ] `psql -d todo_app -c 'SELECT * FROM todos'` 查得到同樣的資料
- [ ] `GET /todos/999`、`GET /todos/abc` 都回 404
- [ ] `src/controllers/`、`src/routes/` 跟第 8 堂完全一樣

### 挑戰（可選，加深理解）

1. **看 Prisma 執行的 SQL**：把 `src/db/prisma.js` 的 `new PrismaClient({ adapter })` 改成 `new PrismaClient({ adapter, log: ['query'] })`，打幾次 API，對照終端機印出的 SQL。
2. **少查一次**：`updateTodo` 先 `findUnique` 再 `update`，查了兩次資料庫。查查看 Prisma 的錯誤代碼 `P2025`，想想能不能只查一次。有什麼取捨？
3. **把 notes 也搬進資料庫**：自己替 notes 加一個 model，走一次完整流程。

---

**下一堂 → [第 12 堂 · Prisma 關聯與整合](../12-prisma-relations-integration/)**
