# M5 · JWT：把 session 換成 token 認證

> 主線章節（spine）。接續 [M4]——把「伺服器存狀態」的 session，換成「伺服器不存狀態」的 JWT。

---

## ① 這章你會做出什麼、搞懂什麼

**做出**：登入後拿到一個 JWT，之後請求用 `Authorization: Bearer <token>` 帶上它就能存取自己的 todo。

**搞懂**：
- JWT 的結構，以及最重要的一件事：**它是簽名、不是加密**（payload 明文可讀）
- 為什麼要 `verify` 不能只 `decode`、為什麼要固定 `algorithms`
- Session 與 JWT 的取捨（特別是「撤銷」的代價）
- token 該存在前端哪裡（localStorage vs httpOnly cookie 的風險）

---

## ② 前置檢查

- [ ] 完成 [M4]（懂 session 版的登入、bcrypt、requireAuth）。
- [ ] 讀過 [概念卡：Session 機制](../concepts/session-機制.md)（才比較得出 JWT 的差異）。

---

## ③ 工作坊

**→ [開始工作坊](./工作坊.md)**

| 步驟 | 你會做到 | 檢查點 |
|---|---|---|
| 1 | 移除 session、登入改發 JWT | A |
| 2 | requireAuth 改成驗 token | B |
| 3 | 把 todo 路由的 userId 來源換成 token | C |
| 4 | 親手解開 payload，確認它是明文 | D（完成版） |

完成版在 [`完成版/`](./完成版/)。

---

## ④ 概念卡

- [JWT 是什麼（簽名 ≠ 加密）](../concepts/jwt-是什麼.md) ← 本章必讀
- [Session vs JWT](../concepts/session-vs-jwt.md) — 取捨與「撤銷」的代價
- [Token 該存哪裡](../concepts/token-存哪裡.md) — localStorage vs httpOnly cookie

---

## ⑤ 驗收 + 挑戰

> ✏️ **課堂練習**：做完工作坊後，先試 [課堂練習](./課堂練習.md)——不看完成版、自己寫出 `requireAuth` 並加 `/auth/me`，還要戳破一個 `decode` 取代 `verify` 的安全漏洞。練的是這章最危險的那一點，跟下面的挑戰（過期 / refresh）分工。

### 驗收

```bash
cd 完成版
npm install
cp .env.example .env       # 設 DATABASE_URL 與 JWT_SECRET
npm run generate && npm run migrate
npm run dev
```

確認：

- [ ] `POST /auth/login` 回傳 `token`
- [ ] 帶 `Authorization: Bearer <token>` 能存取 `/todos`
- [ ] 不帶 token、或竄改 token，回 401
- [ ] 把 token 中間那段 base64 解開，看到的是**明文** payload（證明沒被加密）

### 挑戰（可選）

1. 讓 token 過期時間縮短到 `30s`，等過期後再打，觀察 401。
2. 實作 refresh token：access token 短期、refresh token 長期，用後者換新的 access token。
3. 思考並寫下：如果要「立刻讓某個 token 失效」，你會怎麼做？（提示：黑名單，但會犧牲無狀態）

---

**下一章 → [M6 · OAuth：用 Google 帳號登入]**
