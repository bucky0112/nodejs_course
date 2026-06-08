# 概念卡：Supabase 的金鑰與連線

> 一句話：Supabase 給你一個託管的 PostgreSQL，加上幾把用途不同的金鑰。搞清楚「哪把金鑰能做什麼、連線字串該用哪個」是入門最容易卡的地方。

---

## 一、Supabase 是什麼

它是一個「後端即服務」：核心就是一個**託管的 PostgreSQL**，外加 Auth、檔案儲存、Realtime、自動產生的 API 等。

對本課程來說最重要的一件事：**它底層就是 PostgreSQL**。所以你前面用 Drizzle 寫的 todo app，只要把連線字串換成 Supabase 的，**程式一行都不用改**就能跑在上面。

---

## 二、新版金鑰：`sb_publishable_` 與 `sb_secret_`

> ⚠️ 注意：Supabase 已改用新版金鑰。舊教材常見的 `anon` / `service_role` 金鑰（長得像 `eyJhbGci...` 的 JWT）正在被取代。

| 金鑰 | 長相 | 放哪 | 權限 |
|---|---|---|---|
| **Publishable** | `sb_publishable_...` | 可放前端 | 公開、受 RLS 限制 |
| **Secret** | `sb_secret_...` | **只能放後端** | 繞過 RLS，全權限 |

兩個重點：
1. 新版金鑰**不是 JWT**（格式是 `sb_publishable_…` / `sb_secret_…`，不是 `eyJ...`）。
2. **`sb_secret_` 絕對不能放到前端或進版控**——它能繞過所有 RLS 規則。

---

## 三、連線字串：用 Supavisor pooler，不要用直連

> ⚠️ 舊教材教的直連格式 `postgresql://postgres:[PWD]@db.[REF].supabase.co:5432/postgres` 對新專案常連不上。

現在到 Dashboard 的 **Connect** 面板複製連線字串，主機會長這樣（Supavisor 連線池）：

```
postgresql://postgres.[REF]:[PWD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

- 使用者名稱是 `postgres.[專案ref]` 形式。
- **直接從 Dashboard 複製**，不要自己手刻——格式會隨設定不同。

把它放進 `.env` 的 `DATABASE_URL`，你的 Drizzle app 就連上 Supabase 了。

---

## 延伸
- 為什麼前端用 publishable key 還能安全？靠 RLS → [概念卡：Supabase RLS](./supabase-rls.md)
- Supabase 的 Realtime 怎麼來的 → [概念卡：Supabase Realtime](./supabase-realtime.md)
