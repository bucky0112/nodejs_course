# 概念卡：Supabase RLS（Row Level Security）

> 一句話：RLS 是 PostgreSQL 內建的「**列層級權限**」——直接在資料庫層規定「誰能看/改哪幾列」。因為前端會直接拿金鑰打資料庫，所以 RLS 是 Supabase 安全的根本。

---

## 一、為什麼 Supabase 特別需要 RLS

傳統架構：前端 → 你的後端 → 資料庫。後端幫你擋權限。

Supabase 允許**前端直接用 publishable key 打資料庫**。少了後端這層，那「誰能存取哪些資料」由誰把關？答案就是 **RLS**——權限規則寫在資料庫裡，不管誰來、用什麼方式查，都得通過。

---

## 二、anon/publishable key vs service_role/secret key

| 金鑰 | 受 RLS 限制嗎 |
|---|---|
| publishable（前端） | **會**，只能看到 RLS 允許的列 |
| secret（後端） | **不會**，繞過 RLS、全看得到 |

所以：
- 前端用 publishable key 是安全的——**前提是你有設好 RLS**。
- 後端用 secret key 要小心——它繞過 RLS，等於資料庫的萬能鑰匙。

> ⚠️ 如果一張公開表**沒開 RLS**，又用 publishable key 操作，等於任何人都能讀寫——這是 Supabase 最常見的安全漏洞。

---

## 三、RLS 長什麼樣

開啟 RLS 並加一條「只能看自己的 todo」政策：

```sql
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "只能看自己的 todo"
ON todos FOR SELECT
USING (auth.uid() = user_id);
```

- `ENABLE ROW LEVEL SECURITY`：開啟後，**預設拒絕所有存取**，直到你加政策放行。
- `USING (...)`：定義「哪些列可見」的條件。`auth.uid()` 是 Supabase Auth 目前登入者的 id。

---

## 四、什麼時候用哪把金鑰

- **前端直接存取資料** → publishable key + 設好 RLS。
- **後端做需要全權限的事**（管理操作、跨使用者）→ secret key（只在伺服器，繞過 RLS）。
- 本課程的 Drizzle app 在後端用連線字串直連，屬於「後端全權限」這種——RLS 主要在「前端直接打 Supabase」的情境才是主角。

---

## 延伸
- 金鑰格式與連線字串 → [概念卡：Supabase 的金鑰與連線](./supabase-金鑰與連線.md)
