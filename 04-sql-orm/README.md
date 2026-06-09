# M2 · 接資料庫：用 Drizzle 把 todo 存進 PostgreSQL

> 主線章節（spine）。接續 [M1] 的 todo app——把存在記憶體的陣列，換成真正的 PostgreSQL 資料庫。

---

## ① 這章你會做出什麼、搞懂什麼

**做出**：把 M1 的 todo API 改成用 Drizzle ORM 操作 PostgreSQL。重啟伺服器後資料**不再消失**。

**搞懂**：
- ORM 是什麼、為什麼用它（而不是手拼 SQL 字串）
- 用 Drizzle 定義 schema（對應 [S1] 手寫的那張 todos 表）
- migration 是什麼、`generate` / `migrate` / `push` 的差別
- Drizzle 的查詢 API：`select` / `insert` / `update` / `delete`
- Express 5 的 async 錯誤自動轉交在實戰怎麼省事

---

## ② 前置檢查

- [ ] 完成 [M1]（手上有記憶體版的 todo app）。
- [ ] 完成 [S1]（懂 SQL 的 CRUD 與表結構）——這章會看到 Drizzle 產生的 SQL 就是你寫過的。
- [ ] 本機有 **PostgreSQL** 且能連線（`pg_isready` 顯示 accepting connections）。

---

## ③ 工作坊

**→ [開始工作坊](./工作坊.md)**

| 步驟 | 你會做到 | 檢查點 |
|---|---|---|
| 0–1 | 從 M1 接手、裝套件、設定連線 | A |
| 2–3 | 用 Drizzle 定義 schema、建立 db client | B |
| 4 | 產生並套用 migration | C |
| 5–6 | 把路由改成 Drizzle 查詢、驗證資料持久化 | D（完成版） |

完成版在 [`完成版/`](./完成版/)。

---

## ④ 概念卡

- [ORM 是什麼（為什麼用 Drizzle）](../concepts/orm-是什麼.md)
- [Drizzle Migration](../concepts/drizzle-migration.md) — generate / migrate / push 的差別
- 需要回顧 SQL？→ [SQL 關聯與 JOIN](../concepts/sql-關聯與join.md)

---

## ⑤ 驗收 + 挑戰

> ✏️ **課堂練習**：做完工作坊後，先試 [課堂練習](./課堂練習.md)——不看完成版、自己用 Drizzle 長出一張新表 `notes`，從定義 schema、跑一次 `generate` + `migrate`，到寫完整 CRUD 整套走一遍。練的是「能不能獨立把流程跑完」，跟下面的挑戰（延伸功能）分工。

### 驗收

```bash
createdb todo_app
cd 完成版
npm install
cp .env.example .env        # 把 DATABASE_URL 改成你的 todo_app 連線字串
npm run generate            # 產生 migration
npm run migrate             # 套用到資料庫
npm run dev
```

確認：

- [ ] CRUD 五個端點都正常（同 M1 的驗收清單）
- [ ] **新增幾筆 todo 後，重啟伺服器，資料還在**（這就是接資料庫的意義）
- [ ] 打開 `drizzle/0000_*.sql`，確認產生的 SQL 跟你在 S1 手寫的一致
- [ ] （選）`npm run studio` 開 Drizzle Studio 看資料

### 挑戰（可選）

1. 在 schema 加一個 `priority`（整數）欄位，跑一次 `generate` + `migrate`，觀察新的 migration 檔。
2. 讓 `GET /todos?completed=true` 用 Drizzle 的 `where(eq(todos.completed, true))` 過濾。
3. 把 todo 路由抽到 `src/routes/todos.js`（用 `express.Router()`），讓 `app.js` 更乾淨。

---

**下一章 → [M3 · 關聯：幫 todo 加上清單與標籤]**
