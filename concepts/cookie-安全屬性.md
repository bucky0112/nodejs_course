# 概念卡：Cookie 的安全屬性

> 一句話：`HttpOnly`、`Secure`、`SameSite` 這幾個屬性能**降低**特定攻擊的損害，但每一個都不是「萬靈丹」——理解它「防什麼、不防什麼」很重要。

---

## 一、先搞清楚：Cookie 是什麼

Cookie 是伺服器塞給瀏覽器的一小段資料，瀏覽器之後每次請求**自動帶上**。登入用的 session id（sid）就是存在 cookie 裡，所以瀏覽器才「記得」你登入了。→ [概念卡：Session 機制](./session-機制.md)

正因為 cookie 會自動帶、又存著身分憑證，它是攻擊目標，於是有這幾個保護屬性。

---

## 二、三個關鍵屬性

### `HttpOnly`

讓**瀏覽器的 JavaScript 讀不到**這個 cookie（`document.cookie` 拿不到它）。

> ⚠️ 常見誤解：「HttpOnly 防 XSS」——**錯**。
> HttpOnly **不能阻止 XSS 發生**。網站若有 XSS 漏洞，攻擊者照樣能在你登入的狀態下發請求、操作頁面。HttpOnly 只是讓「XSS 發生時，攻擊者沒辦法直接用 JS 把 cookie 偷走」——是**減災**，不是防禦。
> 真正要防 XSS，靠的是輸出編碼、CSP 等手段（與 cookie 無關）。

### `Secure`

cookie 只在 **HTTPS** 連線時才送出。防止 cookie 在不加密的 HTTP 連線中被中間人攔截。

> 開發時用 `http://localhost` 所以設 `false`；正式環境走 HTTPS 才設 `true`。

### `SameSite`

控制「跨網站的請求要不要帶這個 cookie」，用來**緩解 CSRF**（跨站請求偽造）。

- `Strict`：完全不跨站帶（最嚴，但從外部連結點進來會像沒登入）
- `Lax`（常用預設）：一般跨站請求不帶，但「點連結導航過去」這類會帶
- `None`：永遠帶（必須同時設 `Secure`）

> ⚠️ 同樣地，`SameSite` 是**緩解** CSRF，不是完全防止。高風險操作仍建議搭配 CSRF token。

---

## 三、本課程的設定

```js
cookie: {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 天
}
```

---

## 四、一句話記住每個屬性

| 屬性 | 做什麼 | 不做什麼 |
|---|---|---|
| `HttpOnly` | 讓 JS 讀不到 cookie（減災） | 不防 XSS 本身 |
| `Secure` | 只在 HTTPS 送 | 不防 XSS / CSRF |
| `SameSite` | 緩解 CSRF | 不能完全取代 CSRF token |

---

## 延伸
- 到 [M5] 改用 JWT 時，token 要存哪裡（cookie vs localStorage）又是另一組安全取捨，會再討論。
