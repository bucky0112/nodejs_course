# Node.js 後端工作坊：從零打造一個會員制 todo app

這是一門**邊做邊學**的 Node.js 後端課程。你不會讀一堆理論，而是**一路把同一個 todo app 養大**——從最陽春的 Express 骨架，加上資料庫、關聯、會員登入、Google 登入、頭像上傳，最後部署上線。結業時你會有一個可放作品集的真實專案。

---

## 這門課長什麼樣

每一章都是同一個模板（**五段式**），兼顧現場教學與自學：

1. **這章你會做出什麼、搞懂什麼** — 先設定期待
2. **前置檢查** — 環境與前一章成果，自學者對得上才不卡死
3. **工作坊（Tutorial）** — 線性步驟，每個里程碑一個檢查點，旁邊埋連結指向概念卡
4. **概念卡（Explanation）** — 短、獨立、可單獨複習的「為什麼」
5. **驗收 + 挑戰** — 確認跑得起來 + 進階延伸

每章資料夾固定有：`README.md`（總覽）、`工作坊.md`（動手步驟）、`完成版/`（可跑的里程碑成果）。

**兩種章節：**
- 🟩 **主線（spine）= M1~M8**：同一個 todo app 一路長大，後面依賴前面，**建議照順序走**。
- 🟦 **側模組（side module）= S0~S3**：獨立旁支，穿插在主線之間，有些是進階選讀。

---

## 課程地圖（建議閱讀順序）

| # | 章節 | 類型 | 你會做到 |
|---|---|---|---|
| 01 | [S0 · Node.js 基礎](./01-about-nodejs/) | 🟦 入門前置 | ESM、npm、非同步、原生 http 伺服器 |
| 02 | [M1 · Express 骨架](./02-express-basics/) | 🟩 主線 | 記憶體 todo CRUD，學透路由/middleware/錯誤處理 |
| 03 | [S1 · SQL 基礎](./03-sql-tutorial/) | 🟦 前置 | 手寫 SQL 建出 todo 的資料庫底子 |
| 04 | [M2 · 接資料庫（Drizzle）](./04-sql-orm/) | 🟩 主線 | 把 todo 存進 PostgreSQL，schema/CRUD/migration |
| 05 | [M3 · 關聯](./05-relations/) | 🟩 主線 | 加 lists（1:N）與 tags（M:N） |
| 06 | [M4 · Cookie / Session](./06-cookie-session/) | 🟩 主線 | 加會員登入，todo 變「我的 todo」← 難度分水嶺 |
| 07 | [M5 · JWT](./07-jwt/) | 🟩 主線 | 把 session 換成 token 認證 |
| 08 | [M6 · OAuth](./08-oauth/) | 🟩 主線 | 用 Google 帳號登入（含 state/CSRF） |
| 09 | [M7 · 檔案上傳（S3）](./09-upload-to-s3/) | 🟩 主線 | 會員頭像上傳到 AWS S3 |
| 10 | [S2 · Supabase](./10-supabase/) | 🟦 進階旁支 | 換成雲端 PostgreSQL + Realtime / RLS |
| 11 | [M8 · Railway 部署](./11-railway-deploy/) | 🟩 主線終點 | 把 todo app 真正送上線 |
| 12 | [S3 · Docker 容器化](./12-docker/) | 🟦 進階可選 | 用 Dockerfile / Compose 讓環境完全可攜 |

> **最短完課路徑**：照 M1→M8 主線走（中間的 S0/S1 是地基、會用到），到 **M8 Railway 部署**就有一個上線的 app。S2 Supabase 與 S3 Docker 是進階旁支，行有餘力再看。

### todo app 的成長弧

```
M1 Express 骨架    → 記憶體 todo CRUD（先會動，連 DB 都還沒）
M2 接 Drizzle      → todo 存進 PostgreSQL
M3 關聯            → 加 lists(1:N) 與 tags(M:N)
M4 Cookie/Session  → 加會員登入，todo 變「我的 todo」  ← 難度分水嶺
M5 JWT             → 換 token 認證
M6 OAuth           → Google 登入
M7 S3 上傳         → 會員頭像（此時 user/auth 已齊）
M8 Railway 部署    → 上線
```

---

## 概念卡索引

概念卡是獨立的「為什麼」說明，工作坊步驟會在對應時機連過去，課後也能單獨複習。安全相關的卡刻意把**優點與代價寫在同一段**，避免把觀念講得太樂觀。

**Node / Express**
- [ESM vs CommonJS](./concepts/esm-vs-cjs.md) · [Node.js 的非同步機制](./concepts/非同步機制.md)
- [Express Middleware](./concepts/express-middleware.md) · [HTTP 狀態碼](./concepts/http-狀態碼.md) · [Express 的錯誤處理](./concepts/express-錯誤處理.md)

**資料庫**
- [SQL JOIN 與關聯](./concepts/sql-關聯與join.md) · [SQL 交易](./concepts/sql-交易.md)
- [ORM 是什麼](./concepts/orm-是什麼.md) · [Drizzle migration](./concepts/drizzle-migration.md) · [Drizzle 關聯查詢](./concepts/drizzle-關聯查詢.md)

**認證與安全**
- [Cookie 安全屬性](./concepts/cookie-安全屬性.md) · [密碼雜湊 bcrypt](./concepts/密碼雜湊-bcrypt.md)
- [Session 機制](./concepts/session-機制.md) · [JWT 是什麼](./concepts/jwt-是什麼.md) · [Session vs JWT](./concepts/session-vs-jwt.md)
- [Token 存哪裡](./concepts/token-存哪裡.md) · [OAuth 流程](./concepts/oauth-流程.md)

**檔案、雲端、部署**
- [檔案上傳 multer](./concepts/檔案上傳-multer.md) · [S3 presigned URL](./concepts/s3-presigned-url.md)
- [Supabase 金鑰與連線](./concepts/supabase-金鑰與連線.md) · [Supabase RLS](./concepts/supabase-rls.md) · [Supabase Realtime](./concepts/supabase-realtime.md)
- [部署：環境變數與正式設定](./concepts/部署-環境變數與正式設定.md) · [Docker image vs container](./concepts/docker-image-vs-container.md)

---

## 技術棧

- **Runtime**：Node.js 22 LTS（全程 ESM）
- **框架**：Express 5
- **資料庫**：PostgreSQL（本機 / Supabase / Railway）
- **ORM**：Drizzle ORM
- **認證**：bcrypt、express-session、JWT、Google OAuth
- **雲端 / 部署**：AWS S3、Supabase、Railway、Docker

---

## 環境需求

- **Node.js 22 LTS 以上**（`node -v` 確認；建議用 [nvm](https://github.com/nvm-sh/nvm) 管理版本）
- **PostgreSQL 16+**（M2 起需要；本機安裝或用 Docker 起一個都行）
- 一個能打 API 的工具：VS Code REST Client、Postman，或終端機 `curl`
- 後段章節各自需要的免費帳號：AWS（M7）、Supabase（S2）、Railway（M8）、Docker Desktop（S3）

## 快速開始

```bash
# 從第一章開始
cd 01-about-nodejs
# 讀 README.md，跟著 工作坊.md 動手做

# 想直接跑某章的成果，進它的 完成版/
cd 02-express-basics/完成版
npm install
npm run dev
```

> 從 [S0 · Node.js 基礎](./01-about-nodejs/) 開始，照課程地圖一路往下。祝你寫得開心 🚀
