# 概念卡：OAuth 2.0 授權碼流程（Authorization Code Flow）

> 一句話：OAuth 讓使用者「用 Google 帳號登入你的網站」，而**不必把 Google 密碼給你**——你拿到的是 Google 開的「授權憑證」，不是密碼。

---

## 一、為什麼需要 OAuth

你想做「用 Google 登入」，但你**不該、也不能**叫使用者把 Google 密碼輸進你的網站。OAuth 解決的就是這個：使用者在 **Google 自己的頁面**登入授權，Google 再告訴你「這個人是誰」。

---

## 二、Authorization Code Flow 的六步

```
你的後端                使用者瀏覽器              Google
   │                        │                      │
 1 │── 導向 Google 授權頁（帶 state）──────────────►│
   │                        │   2 使用者登入、同意   │
   │◄──── 3 導回你的 callback（?code=...&state=）───│
 4 │── 用 code + client_secret 換 access token ───►│  （後端對後端）
   │◄──────────── 5 回傳 access token ─────────────│
 6 │── 用 token 取得使用者資訊 ────────────────────►│
   │◄──────────── 回傳 { id, email, name } ────────│
   │
 7 你找/建使用者，簽發「你自己的」JWT 給前端
```

關鍵：**`client_secret` 只在後端（第 4 步）用**，永遠不出現在瀏覽器，所以前端偷不到。

---

## 三、最重要的安全機制：`state`（防 CSRF）

> ⚠️ 這是 OAuth 教學最常被漏掉、卻最關鍵的一步。沒有它，登入流程可被 CSRF 攻擊。

做法：
1. 第 1 步導向 Google 前，產生一段隨機 `state`，存進**短期 httpOnly cookie**，並把它放進導向網址。
2. 第 3 步 Google 導回來時，比對「網址帶回的 state」與「cookie 裡的 state」。
3. **不一致就拒絕**（403）。

```js
// 導向前
const state = crypto.randomBytes(16).toString('hex')
res.cookie('oauth_state', state, { httpOnly: true, sameSite: 'lax', maxAge: 5 * 60 * 1000 })
// ...redirect 帶上 state...

// 回呼時
if (!req.query.state || req.query.state !== req.cookies.oauth_state) {
  return res.status(403).json({ error: 'state 不符（可能是 CSRF）' })
}
```

為什麼有效：攻擊者沒辦法偽造出「與受害者瀏覽器 cookie 一致」的 state，所以偽造的回呼會被擋下。

---

## 四、另一個常見錯誤：別把使用者資料塞進 URL

> ⚠️ 有些教學在登入成功後 `res.redirect('/home?user=' + JSON.stringify(user))`，把使用者資料（甚至 token）放進 query string。

URL 會留在**瀏覽器歷史、Referer header、伺服器 log**裡，是不安全的身分傳遞方式。正確做法：簽發你自己的 JWT，設成 **httpOnly cookie** 或交給前端安全保存——而不是塞進網址。

---

## 五、拿到 Google 使用者後，發「你自己的」憑證

OAuth 只負責「確認這個人是誰」。確認後，你應該用**自己的** session 或 JWT 來維持登入狀態（本課程簽發自己的 JWT，延續 M6），而不是一直拿 Google 的 token 到處跑。

---

## 延伸
- `scope: 'openid email profile'` 決定你跟使用者要哪些資料（email、基本資料）。要越多，使用者同意畫面列的就越多。
- callback 網址必須與 Google Console 設定的「已授權的重新導向 URI」**完全一致**，否則 Google 會拒絕。
