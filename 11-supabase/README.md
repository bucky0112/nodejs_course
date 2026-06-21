# S2 · Supabase：雲端 PostgreSQL + Realtime

> 側模組（side module）· 進階旁支／選讀。不是主線必經——它示範「換一種雲端後端」，以及 Supabase 獨有的 Realtime / Auth / RLS。

---

## ① 這章你會做出什麼、搞懂什麼

**做出**：把前面的 todo app（M2~M8）的資料庫**一行程式不改**，直接搬到 Supabase 託管的 PostgreSQL 上；再加一個「資料一變、前端即時收到」的 Realtime 監聽。

**搞懂**：
- Supabase 本質就是託管 PostgreSQL（所以 Drizzle 程式不用改）
- 新版金鑰（publishable / secret）與正確的連線字串（Supavisor pooler）
- RLS：前端能直接打資料庫的安全根本
- Realtime 是什麼、它其實是 Postgres logical replication 的包裝

---

## ② 前置檢查

- [ ] 完成 [M2]（會用 Drizzle）。本章把 DB 換成 Supabase，不重教 Drizzle CRUD。
- [ ] 一個 [Supabase](https://supabase.com/) 免費專案。

---

## ③ 工作坊

**→ [開始工作坊](./工作坊.md)**

| 步驟 | 你會做到 | 檢查點 |
|---|---|---|
| 1 | 取得金鑰與 pooler 連線字串 | A |
| 2 | 把 todo app 的 DATABASE_URL 指向 Supabase（不改程式） | B |
| 3 | 加 Realtime 監聽 todos 變化 | C |
| 4 | 認識 RLS | D |

完成版（Realtime 範例）在 [`完成版/`](./完成版/)。

---

## ④ 概念卡

- [Supabase 的金鑰與連線](../concepts/supabase-金鑰與連線.md) — 新版金鑰、Supavisor pooler
- [Supabase RLS](../concepts/supabase-rls.md) — 列層級權限、anon vs service_role
- [Supabase Realtime](../concepts/supabase-realtime.md) — 訂閱資料變化

---

## ⑤ 驗收 + 挑戰

> ✏️ **課堂練習**：做完工作坊後，先試 [課堂練習](./課堂練習.md)——不看程式碼、自己寫一條 RLS policy 讓使用者只能讀到自己的資料，並用「有權／無權」兩種身分各查一次，驗證它真的擋得住。練的是「能不能獨立寫出並驗證 RLS」，跟下面的挑戰（延伸功能）分工。

### 驗收

```bash
cd 完成版
npm install
cp .env.example .env       # 填 SUPABASE_URL 與 publishable key
# 在 Supabase 後台把 todos 表加入 Realtime（Database → Publications）
npm run listen
```

確認：

- [ ] 把 M2 的 todo app `DATABASE_URL` 換成 Supabase pooler 字串後，app **不改程式**就能跑、資料寫進 Supabase
- [ ] `npm run listen` 後，在 Supabase 後台新增一筆 todo，終端機**即時**印出變化

### 挑戰（可選）

1. 開一條 RLS 政策「只能看自己的 todo」，並用 publishable key 測試擋不擋得住。
2. 做一個簡單前端（HTML + supabase-js），把 Realtime 變化即時畫到畫面上。

---

**下一章 → [M9 · Railway 部署]**（把 todo app 送上線）
