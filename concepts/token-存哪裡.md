# 概念卡：Token 該存在瀏覽器哪裡

> 一句話：JWT 在前端常見存法有 `localStorage` 和 `httpOnly cookie`，兩者各自暴露在不同攻擊面（XSS vs CSRF），沒有「完全安全」的選項——重點是知道風險並對應防護。

---

## 一、兩種存法的取捨

| 存法 | 怕的攻擊 | 說明 |
|---|---|---|
| `localStorage` | **XSS** | JS 讀得到，一旦頁面被 XSS，token 直接被偷走 |
| `httpOnly cookie` | **CSRF** | JS 讀不到（較抗 XSS 竊取），但 cookie 會自動帶，要防 CSRF |

---

## 二、`localStorage`：方便，但對 XSS 很脆弱

```js
localStorage.setItem('token', token)        // 存
fetch('/todos', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
```

- ✅ 簡單、跨網域呼叫 API 直覺。
- ❌ **任何 XSS 都能 `localStorage.getItem('token')` 把 token 偷走**。這是它最大的問題。

> ⚠️ 很多教學直接教存 `localStorage` 卻不提這個風險。會用可以，但你必須知道：這把整個帳號的安全押在「網站完全沒有 XSS」上。

---

## 三、`httpOnly cookie`：較抗 XSS 竊取，但要處理 CSRF

把 token 放進 `httpOnly` 的 cookie：

- ✅ JS 讀不到（`document.cookie` 拿不到），XSS 較難直接偷走 token。
- ❌ cookie 會自動跟著請求送，可能被 CSRF 利用 → 需搭配 `SameSite` 與（必要時）CSRF token。
- → [概念卡：Cookie 的安全屬性](./cookie-安全屬性.md)

---

## 四、實務建議

- **瀏覽器網頁應用**：傾向用 `httpOnly` + `Secure` + `SameSite` 的 cookie 存 token，並處理 CSRF。比 localStorage 安全。
- **行動 App / 純 API client**：沒有瀏覽器 XSS 問題，用 `Authorization: Bearer` header 帶 token 很合理（存在 App 的安全儲存區）。
- **無論哪種**：根本還是要**消滅 XSS**（輸出編碼、CSP），因為 XSS 一旦發生，存哪裡都難全身而退。

> 本課程的 M6 後端用 `Authorization: Bearer` header 示範（最通用的 API 形式）。若要接瀏覽器前端正式上線，請依上面取捨選擇存法，不要無腦丟 localStorage。

---

## 延伸
- 為什麼 httpOnly「不是防 XSS、只是減災」→ [概念卡：Cookie 的安全屬性](./cookie-安全屬性.md)
- token 本身的內容是明文 → [概念卡：JWT 是什麼](./jwt-是什麼.md)
