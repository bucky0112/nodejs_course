# 概念卡：Drizzle Migration

> 一句話：migration 是「把資料庫結構的每次變更記成可重播的 SQL 檔」，讓你的資料庫結構跟程式碼一樣有版本可追。

---

## 一、為什麼需要 migration

你在 `schema.js` 改了表結構（加一個欄位），但**資料庫不會自己知道**。migration 就是中間的橋：把「schema 的變更」轉成 SQL，套用到資料庫。

好處：團隊每個人、每台機器、正式環境，都能用同一串 migration 跑出**一模一樣的資料庫結構**。

---

## 二、Drizzle 的指令（drizzle-kit）

| 指令 | 做什麼 | 何時用 |
|---|---|---|
| `drizzle-kit generate` | 比對 schema 與現有 migration，**產生**新的 SQL migration 檔 | 改完 schema 後 |
| `drizzle-kit migrate` | 把還沒套用的 migration **執行**到資料庫 | 要把變更套上去時 |
| `drizzle-kit push` | 跳過 migration 檔，直接把 schema **推**到資料庫 | 快速試做 / 原型階段 |
| `drizzle-kit studio` | 開一個網頁 GUI 看資料 | 想視覺化檢視時 |

典型流程：**改 schema → `generate` → `migrate`**。

---

## 三、generate + migrate vs push

兩種改資料庫的方式，差在「有沒有留下 migration 檔」：

- **`generate` + `migrate`**（推薦，正式用）：留下 `drizzle/` 資料夾裡的 SQL 檔，可追蹤、可在別台機器/正式環境重播。團隊協作與上線都靠它。
- **`push`**（方便，原型用）：直接同步，不留檔。一個人快速試 schema 很方便，但不適合正式環境（沒有變更紀錄、難回溯）。

> 本課程主線用 `generate` + `migrate`，養成正確習慣；趕時間試 schema 時才用 `push`。

---

## 四、實際長什麼樣

`drizzle-kit generate` 會在 `drizzle/` 產生類似這樣的檔：

```sql
-- drizzle/0000_xxx.sql
CREATE TABLE "todos" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "title" varchar(200) NOT NULL,
  "completed" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
```

看到沒？這就是你在 [S1] 手寫的 SQL。Drizzle 只是幫你從 `schema.js` 產生它。

---

## 延伸
- migration 檔一旦套用到正式環境就**不要再改它**，要修就產生一個新的 migration。
- `drizzle/meta/` 是 Drizzle 用來追蹤「目前套到哪」的內部紀錄，別手動改。
