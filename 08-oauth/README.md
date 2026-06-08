# M6 · OAuth：用 Google 帳號登入

> 主線章節（spine）。接續 [M5]——加上「用 Google 登入」，讓使用者不必為你的網站另記一組帳密。

---

## ① 這章你會做出什麼、搞懂什麼

**做出**：使用者點「用 Google 登入」→ 到 Google 授權 → 導回你的網站 → 拿到你簽發的 JWT。帳密登入（M5）與 Google 登入並存。

**搞懂**：
- OAuth 2.0 的授權碼流程（authorization code flow）每一步在做什麼
- `state` 參數怎麼防 CSRF（**OAuth 最常被漏掉的安全機制**）
- 為什麼 `client_secret` 只能放後端
- 拿到 Google 使用者後，為什麼要簽發「自己的」JWT，而不是把資料塞進 URL

---

## ② 前置檢查

- [ ] 完成 [M5]（懂 JWT、`signToken`、requireAuth）。
- [ ] 有一個 Google 帳號，能進 [Google Cloud Console](https://console.cloud.google.com/)。

### 取得 Google OAuth 憑證（圖文步驟）

> 這是初學者最容易卡住的地方，請照著做：

1. 進 [Google Cloud Console](https://console.cloud.google.com/) → 建立一個新專案（或選現有的）。
2. 左側選單 → **API 和服務** → **OAuth 同意畫面**：
   - User Type 選 **外部（External）**，填好應用程式名稱、支援信箱。
   - 「測試使用者」加入你自己的 Google 信箱（開發階段才能登入）。
3. **API 和服務** → **憑證** → **建立憑證** → **OAuth 用戶端 ID**：
   - 應用程式類型選 **網頁應用程式**。
   - **已授權的重新導向 URI** 填：`http://localhost:3000/auth/google/callback`
     （⚠️ 必須與程式裡的 `GOOGLE_REDIRECT_URI` **一字不差**）
4. 建立後會拿到 **用戶端 ID** 與 **用戶端密鑰**，填進 `.env`。

---

## ③ 工作坊

**→ [開始工作坊](./工作坊.md)**

| 步驟 | 你會做到 | 檢查點 |
|---|---|---|
| 0 | 取得 Google 憑證、設 .env | A |
| 1 | schema 加 googleId、導向 Google（帶 state） | B |
| 2 | callback：驗 state、換 token、取使用者 | C |
| 3 | 找/建使用者、簽發自己的 JWT | D（完成版） |

完成版在 [`完成版/`](./完成版/)。

---

## ④ 概念卡

- [OAuth 2.0 授權碼流程](../concepts/oauth-流程.md) — 六步、state/CSRF、別把資料塞 URL
- [JWT 是什麼](../concepts/jwt-是什麼.md) — 回顧：我們最後簽發的是自己的 JWT

---

## ⑤ 驗收 + 挑戰

### 驗收

```bash
cd 完成版
npm install
cp .env.example .env       # 填入 Google 憑證、DATABASE_URL、JWT_SECRET
npm run generate && npm run migrate
npm run dev
```

用瀏覽器開 `http://localhost:3000/auth/google`，確認：

- [ ] 被導到 Google 的授權頁，網址帶有 `state=...`
- [ ] 授權後導回 callback，拿到 `{ token, user }`
- [ ] 用這個 token 帶 `Authorization: Bearer` 能存取 `/todos`
- [ ] （安全）手動把 callback 的 `state` 改掉再打，會被回 403

### 挑戰（可選）

1. 把簽發的 JWT 改成設進 **httpOnly cookie**，而不是回 JSON（更接近正式做法）。
2. 處理「同一個 email 已用密碼註冊、又用 Google 登入」的情況（綁定到同一個帳號）。
3. 加上 `picture`（Google 頭像）到使用者資料——這會銜接下一章的頭像功能。

---

**下一章 → [M7 · 檔案上傳：會員頭像（S3）]**
