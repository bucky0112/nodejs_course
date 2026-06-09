# M4 · Cookie / Session：加上會員登入

> 主線章節（spine）· **進階分水嶺**。接續 [M3]——todo 從「大家共用」變成「我的 todo」。這章引入會員、密碼雜湊與 session。

---

## ① 這章你會做出什麼、搞懂什麼

**做出**：使用者能註冊、登入、登出；登入後才能操作 todo，而且**只看得到自己的**。

**搞懂**：
- HTTP 為什麼「無狀態」、session 怎麼用 cookie 認人
- 密碼為什麼要雜湊（不是加密、更不能存明文）、bcrypt 怎麼用
- cookie 的 `HttpOnly` / `Secure` / `SameSite` 各防什麼、不防什麼
- 用 `requireAuth` middleware 保護路由、把資料綁到登入者

---

## ② 前置檢查

- [ ] 完成 [M3]（todo app 有關聯式資料模型）。
- [ ] 知道怎麼用 cookie jar 測 API（`curl -c/-b`，或 Postman 會自動保存 cookie）。

---

## ③ 工作坊

**→ [開始工作坊](./工作坊.md)**

| 步驟 | 你會做到 | 檢查點 |
|---|---|---|
| 1 | 加 users 表、todos 綁 userId | A |
| 2 | 設定 express-session | B |
| 3 | 註冊 / 登入 / 登出（bcrypt 雜湊密碼） | C |
| 4 | requireAuth 保護路由、todo 綁登入者 | D（完成版） |

完成版在 [`完成版/`](./完成版/)。

---

## ④ 概念卡

- [HTTP 無狀態與 Session 機制](../concepts/session-機制.md)
- [密碼雜湊與 bcrypt](../concepts/密碼雜湊-bcrypt.md) — 雜湊 ≠ 加密、加鹽、work factor
- [Cookie 的安全屬性](../concepts/cookie-安全屬性.md) — HttpOnly/Secure/SameSite 防什麼、不防什麼
- [Express Middleware](../concepts/express-middleware.md) — 回顧 middleware（requireAuth 就是一個）

---

## ⑤ 驗收 + 挑戰

> ✏️ **課堂練習**：做完工作坊後，先試 [課堂練習](./課堂練習.md)——不看程式碼、自己把 bcrypt 雜湊／比對與 session 版 `requireAuth` 親手寫一遍。練的是「能不能獨立寫出來」，跟下面的挑戰（延伸功能）分工。

### 驗收

```bash
cd 完成版
npm install
cp .env.example .env       # 設好 DATABASE_URL 與 SESSION_SECRET
npm run generate && npm run migrate
npm run dev
```

確認：

- [ ] `POST /auth/register` 能註冊，回傳不含密碼
- [ ] 資料庫 `users.password_hash` 存的是 `$2b$...` 雜湊（不是明文）
- [ ] 未登入打 `GET /todos` 回 401
- [ ] 登入後建立的 todo 帶 `userId`，且 `GET /todos` 只看得到自己的
- [ ] 用另一個帳號登入，看不到別人的 todo（拿別人的 id 回 404）
- [ ] 登出後，原本的 cookie 失效（回 401）

### 挑戰（可選）

1. 加密碼強度檢查（至少含數字與英文字母）。
2. 把 session 改存進 PostgreSQL（用 `connect-pg-simple`），讓重啟後登入不失效。
3. 讓 lists / tags 也變成「個人化」（綁 userId），而不是共用。

---

**下一章 → [M5 · JWT：把 session 換成 token 認證]**
