# 第 9 堂 · PostgreSQL 基礎：todo app 的資料庫底子

> 對應課綱第 9 堂：關聯模型、SQL CRUD、JOIN。這堂不寫 app，而是用**原生 SQL** 把「資料庫到底在做什麼」打穩。[第 11 堂](../11-prisma-basics/)改用 Prisma 把 todo app 接上資料庫時，你會看懂它幫你產生的 SQL。

---

## ① 這堂你會做出什麼、搞懂什麼

**做出**：用純 SQL 親手建立 todo app 的資料庫——todos、lists、tags 三張表加上關聯，並做完整的 CRUD、JOIN、聚合查詢。

**搞懂**：
- 資料為什麼要拆成多張表、外鍵怎麼把它們連起來（關聯模型）
- CRUD 的 SQL 語法（INSERT / SELECT / UPDATE / DELETE）
- 一對多（1:N）與多對多（M:N）怎麼設計
- JOIN 怎麼把分散的資料拼回來
- `UPDATE` / `DELETE` 的安全習慣（先 `SELECT` 再動手）

> **為什麼先學 SQL 再學 ORM？** 因為 ORM 只是「幫你寫 SQL 的工具」。看得懂底層 SQL，你才知道 ORM 在做什麼、出問題時才 debug 得動。

> 交易（`BEGIN` / `COMMIT` / `ROLLBACK`）、index、正規化放在下一堂 → [第 10 堂](../10-postgresql-advanced/)。

---

## ② 前置檢查

- [ ] 安裝 **PostgreSQL**（本課程的資料庫，全程使用它）。
  - macOS：[Postgres.app](https://postgresapp.com/) 最簡單，或 `brew install postgresql`
  - Windows / Linux：[官方安裝程式](https://www.postgresql.org/download/)
  - 不想裝？也可用免費雲端（[Supabase](https://supabase.com/) / [Neon](https://neon.tech/)）拿一個連線字串
- [ ] 會用 `psql`（終端機）或任一 GUI（TablePlus、DBeaver、pgAdmin）連到資料庫。
  - Windows 打 `psql` / `createdb` 出現「找不到指令」→ [概念卡：Windows 指令對照 § 四](../concepts/windows-指令對照.md)

> ⚠️ 本課程的 SQL 以 **PostgreSQL** 為準。部分語法（`GENERATED AS IDENTITY`、`TIMESTAMPTZ`、集合運算）在 MySQL 不同或不存在，請勿混用。

---

## ③ 工作坊

**→ [開始工作坊](./工作坊.md)**

| 步驟 | 你會做到 | 檢查點 |
|---|---|---|
| 0–1 | 連到資料庫、建立 todos 表 | A |
| 2–3 | INSERT 資料、各種 SELECT 查詢 | B |
| 4 | UPDATE / DELETE 與「先 SELECT 再動手」 | C |
| 5–6 | 加 lists(1:N)、tags(M:N)、JOIN 查詢 | D（完成版） |

完成版 SQL 放在 [`完成版/`](./完成版/)（`schema.sql` / `seed.sql` / `queries.sql`），可直接 `psql -f` 執行對照。

---

## ④ 概念卡

- [SQL 關聯與 JOIN](../concepts/sql-關聯與join.md) — 1:N、M:N、外鍵、各種 JOIN

---

## ⑤ 驗收 + 挑戰

> ✏️ **課堂練習**：做完工作坊後，先試 [課堂練習](./課堂練習.md)——不看 `queries.sql`、自己把這堂的 JOIN／多表查詢親手寫一次。練的是「能不能獨立判斷該用哪種 JOIN 並寫出來」，跟下面的挑戰（子查詢、聚合、外鍵行為）分工。

### 驗收：一鍵建好整個資料庫

```bash
createdb todo_sql
cd 完成版
psql -d todo_sql -f schema.sql
psql -d todo_sql -f seed.sql
psql -d todo_sql -f queries.sql   # 三個檔依序跑完都沒有 ERROR 才算過
```

接著在 `psql -d todo_sql` 裡確認你能寫出：

- [ ] 查出所有「未完成」的 todo，依建立時間排序
- [ ] 算出每個清單有幾筆 todo（含 0 筆的空清單）
- [ ] 查出每筆 todo 連同它的清單名稱（1:N JOIN）
- [ ] 查出每筆 todo 連同它的標籤（M:N JOIN）

> 這個 `todo_sql` 資料庫下一堂還會用到，先別刪。

### 挑戰（可選）

1. 查出「沒有任何標籤」的 todo（提示：`LEFT JOIN todo_tags` 後找 `tag_id IS NULL`）。
2. 查出「被貼最多標籤」的前 3 筆 todo。
3. 新增一個清單並放一筆 todo 進去，再把這個清單刪掉，觀察那筆 todo 的 `list_id` 變成 NULL（因為 `ON DELETE SET NULL`）。如果改成刪掉一筆有標籤的 todo，`todo_tags` 裡會發生什麼事？（看 schema 裡的 `ON DELETE CASCADE`）

---

**下一堂 → [第 10 堂 · PostgreSQL 進階：交易、index、正規化](../10-postgresql-advanced/)**（在同一個 `todo_sql` 資料庫上繼續）
