# 第 10 堂 · PostgreSQL 進階：交易、index、正規化

> 對應課綱第 10 堂：index、交易、正規化、psql。延續 [第 9 堂](../09-postgresql-basics/) 建好的 `todo_sql` 資料庫，學三件「資料一多、功能一複雜就躲不掉」的事。

---

## ① 這堂你會做出什麼、搞懂什麼

**做出**：
- 用交易把多個操作綁成「全有或全無」，親手 `ROLLBACK` 一次反悔
- 用 `generate_series` 灌 10 萬筆 todo，用 `EXPLAIN ANALYZE` 看到加 index 前後查詢計畫從 `Seq Scan` 變成 `Index Scan`
- 把一張「清單名稱直接存字串」的表拆成兩張表，再用第 9 堂的 JOIN 拼回來

**搞懂**：
- 交易是什麼、`BEGIN` / `COMMIT` / `ROLLBACK` 各做什麼、交易中出錯會怎樣
- index 為什麼會讓查詢變快、什麼時候加了也沒用
- 怎麼讀 `EXPLAIN` 的輸出（只看關鍵的那一行就好）
- 正規化在解決什麼問題：重複資料、改名要改一堆列、打錯字就分裂
- 常用的 `psql` 指令（`\dt`、`\d`、`\di`、`\timing`、`\x`、`\i`）

---

## ② 前置檢查

- [ ] 做完 [第 9 堂](../09-postgresql-basics/)，`todo_sql` 資料庫還在，裡面有 `lists`、`todos`、`tags`、`todo_tags` 四張表。
  - 不見了或資料亂掉？重建一次：
    ```bash
    dropdb --if-exists todo_sql
    createdb todo_sql
    cd ../09-postgresql-basics/完成版
    psql -d todo_sql -f schema.sql
    psql -d todo_sql -f seed.sql
    ```
- [ ] `psql -d todo_sql` 連得進去，`\dt` 看得到上面四張表。
  - Windows 打 `psql` 出現「找不到指令」→ [概念卡：Windows 指令對照 § 四](../concepts/windows-指令對照.md)

---

## ③ 工作坊

**→ [開始工作坊](./工作坊.md)**

| 步驟 | 你會做到 | 檢查點 |
|---|---|---|
| 0 | psql 工具箱：常用的反斜線指令 | A |
| 1–2 | 交易：`ROLLBACK` 反悔、`COMMIT` 生效、出錯的交易、兩個連線看到的不一樣 | B |
| 3–4 | index：灌 10 萬筆資料、`EXPLAIN ANALYZE` 比較加 index 前後 | C |
| 5–6 | 正規化：拆表、搬資料、用 JOIN 拼回來 | D（完成版） |

完成版 SQL 放在 [`完成版/`](./完成版/)：

| 檔案 | 內容 |
|---|---|
| [`transaction.sql`](./完成版/transaction.sql) | `BEGIN` / `ROLLBACK`、`BEGIN` / `COMMIT` |
| [`index.sql`](./完成版/index.sql) | 灌 10 萬筆、`EXPLAIN ANALYZE` 前後對照、跑完自動清掉 |
| [`normalization.sql`](./完成版/normalization.sql) | 重複欄位的表 → 拆成兩張表 + 外鍵 → JOIN 拼回 |

三個檔都在第 9 堂的 `todo_sql` 上執行，順序不拘，重複執行也不會出錯。

---

## ④ 概念卡

- [SQL 交易](../concepts/sql-交易.md) — `BEGIN` / `COMMIT` / `ROLLBACK`、破壞性操作的安全習慣
- [SQL 關聯與 JOIN](../concepts/sql-關聯與join.md) — 正規化拆出來的表，靠的就是這張卡的外鍵與 JOIN

---

## ⑤ 驗收 + 挑戰

> ✏️ **課堂練習**：做完工作坊後，試 [課堂練習](./課堂練習.md)——交易、index、正規化各一題，沒有逐步指引，自己判斷該怎麼做。

### 驗收：三個完成版檔都跑得過

```bash
cd 完成版
psql -v ON_ERROR_STOP=1 -d todo_sql -f transaction.sql
psql -v ON_ERROR_STOP=1 -d todo_sql -f index.sql
psql -v ON_ERROR_STOP=1 -d todo_sql -f normalization.sql
```

> `-v ON_ERROR_STOP=1` 讓 psql 一遇到錯誤就停下來，不會錯了還繼續往下跑。

接著確認你能做到：

- [ ] 說出 `COMMIT` 和 `ROLLBACK` 的差別，並親手 `ROLLBACK` 過一次刪除
- [ ] 在 `index.sql` 的輸出裡，指出加 index **前**是 `Seq Scan`、加 index **後**是 `Index Scan`（或 `Bitmap Index Scan`）
- [ ] 說出為什麼 `WHERE completed = false` 就算有 index 也還是 `Seq Scan`
- [ ] 說出 `demo_todos_flat` 有哪兩個問題，拆成 `demo_lists` + `demo_todos` 後怎麼解決

### 挑戰（可選）

1. 在 [第 9 堂](../09-postgresql-basics/) 的 schema 裡，`todos.list_id` 是外鍵——PostgreSQL **不會**自動幫外鍵建 index。灌 10 萬筆資料、新增一個只有幾筆 todo 的清單，比較 `WHERE list_id = <那個清單>` 在建 `todos(list_id)` index 前後的計畫。
2. 把 `index.sql` 的資料量從 10 萬改成 1,000，看看加了 index 之後計畫還會不會變。資料少的時候規劃器為什麼寧願 `Seq Scan`？
3. 開兩個 `psql` 視窗，在 A 視窗 `BEGIN` 後 `UPDATE` 某筆 todo（先不要 `COMMIT`），再到 B 視窗 `UPDATE` 同一筆。B 視窗發生了什麼事？A 視窗 `COMMIT` 之後呢？

---

**下一堂 → [第 11 堂 · Prisma 入門](../11-prisma-basics/)**（用 Prisma 把 todo app 接上 PostgreSQL，`todos` 表的長相跟這兩堂一模一樣）
