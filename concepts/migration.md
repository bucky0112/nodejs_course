# 概念卡：migration（資料表結構的版本紀錄）

> 一句話：migration 是「把資料庫結構的每次變更記成可重播的 SQL 檔」，讓你的資料庫結構跟程式碼一樣有版本可追。

---

## 一、為什麼需要 migration

你在 `schema.prisma` 改了表結構（加一個欄位），但**資料庫不會自己知道**。migration 就是中間的橋：把「schema 的變更」轉成 SQL，存成檔案，再套用到資料庫。

好處：團隊每個人、每台機器、正式環境，都能用同一串 migration 跑出**一模一樣的資料庫結構**。

---

## 二、Prisma 的指令

| 指令 | 做什麼 | 何時用 |
|---|---|---|
| `prisma migrate dev --name <名稱>` | 比對 schema 與資料庫，**產生**新的 migration 檔並**套用** | 開發時改完 schema |
| `prisma migrate dev` | 只套用還沒套用的 migration（schema 沒改時） | 拉下別人的程式碼後 |
| `prisma migrate deploy` | 只**套用**既有的 migration，不產生新的 | 正式環境、CI |
| `prisma migrate reset` | 清空資料庫，從第一個 migration 重新套用 | 開發時資料亂掉想重來 |
| `prisma generate` | 依 schema 產生 Prisma Client | 改完 schema 後（Prisma 7 的 `migrate dev` 不會自動做） |
| `prisma db push` | 跳過 migration 檔，直接把 schema **推**到資料庫 | 快速試做 / 原型階段 |

典型流程：**改 `schema.prisma` → `migrate dev --name 描述這次改了什麼` → `generate` → 改程式**。

---

## 三、migrate dev vs db push

兩種改資料庫的方式，差在「有沒有留下 migration 檔」：

- **`migrate dev`**（推薦，正式用）：留下 `prisma/migrations/` 裡的 SQL 檔，可追蹤、可在別台機器與正式環境重播。團隊協作與上線都靠它。
- **`db push`**（方便，原型用）：直接同步，不留檔。一個人快速試 schema 很方便，但沒有變更紀錄、難回溯，不適合正式環境。

> 本課程用 `migrate dev`，養成正確習慣。

---

## 四、實際長什麼樣

每次 `migrate dev` 會在 `prisma/migrations/` 產生一個資料夾，名稱是「時間 + 你給的名字」：

```sql
-- prisma/migrations/20261125102512_init/migration.sql
CREATE TABLE "todos" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "todos_pkey" PRIMARY KEY ("id")
);
```

看到沒？這就是你在[第 9 堂](../09-postgresql-basics/)手寫的 SQL。Prisma 只是幫你從 `schema.prisma` 產生它。

Prisma 會在資料庫裡建一張 `_prisma_migrations` 表，記錄哪些 migration 已經套用過，所以同一個 migration 不會被執行兩次。

---

## 延伸
- migration 檔要 **commit 進 git**；它是資料表結構的歷史紀錄。
- migration 一旦套用到正式環境就**不要再改它**，要修就產生一個新的 migration。
- `migrate dev` 如果發現資料庫和 migration 紀錄對不上（例如有人手動改過表），會提示要 reset 並清空資料。所以**不要繞過 migration 手動改表**。
