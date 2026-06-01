# Cookie 是什麼？

## 定義

Cookie 是一小段文字資料，由伺服器發送給瀏覽器儲存，之後瀏覽器每次請求都會自動帶上。

```
1. 伺服器回應時設定 Cookie
   HTTP/1.1 200 OK
   Set-Cookie: user_id=abc123

2. 瀏覽器之後的每個請求都會帶上
   GET /orders HTTP/1.1
   Cookie: user_id=abc123
```

## Cookie 的特性

| 特性 | 說明 |
|------|------|
| 自動發送 | 瀏覽器會自動在每個請求帶上 Cookie |
| 有大小限制 | 每個 Cookie 約 4KB |
| 有數量限制 | 每個網域約 20-50 個 |
| 可設過期時間 | 可以是 Session Cookie 或持久 Cookie |
| 綁定網域 | 只會發送給設定它的網域 |

## 在 Express 中使用 Cookie

### 安裝 cookie-parser

```bash
npm install cookie-parser
```

### 基本使用

```javascript
import express from 'express'
import cookieParser from 'cookie-parser'

const app = express()
app.use(cookieParser())

// 設定 Cookie
app.get('/login', (req, res) => {
  res.cookie('username', 'john', {
    maxAge: 24 * 60 * 60 * 1000, // 1 天（毫秒）
    httpOnly: true               // 禁止 JavaScript 存取
  })
  res.send('Cookie 已設定！')
})

// 讀取 Cookie
app.get('/profile', (req, res) => {
  const username = req.cookies.username
  if (username) {
    res.send(`歡迎回來，${username}！`)
  } else {
    res.send('請先登入')
  }
})

// 刪除 Cookie
app.get('/logout', (req, res) => {
  res.clearCookie('username')
  res.send('已登出')
})
```

## Cookie 的重要屬性

```javascript
res.cookie('name', 'value', {
  maxAge: 3600000,      // 存活時間（毫秒），1 小時
  expires: new Date(),  // 或指定過期日期
  httpOnly: true,       // 禁止 JavaScript 存取（防 XSS）
  secure: true,         // 只在 HTTPS 發送
  sameSite: 'strict',   // 防止 CSRF 攻擊
  path: '/',            // Cookie 適用的路徑
  domain: '.example.com' // Cookie 適用的網域
})
```

### 安全屬性說明

| 屬性 | 用途 | 建議 |
|------|------|------|
| `httpOnly` | 防止 XSS 攻擊竊取 Cookie | 敏感 Cookie 必開 |
| `secure` | 只在 HTTPS 傳輸 | 正式環境必開 |
| `sameSite` | 防止 CSRF 攻擊 | 建議設為 `strict` 或 `lax` |

## Cookie 的問題

1. **大小限制** - 只能存 4KB，不適合存大量資料
2. **安全性** - 存在客戶端，用戶可以看到、修改
3. **每次請求都會發送** - 增加網路流量

## Cookie 類型

### Session Cookie（會話 Cookie）
- 沒有設定 `maxAge` 或 `expires`
- 瀏覽器關閉就消失

### Persistent Cookie（持久 Cookie）
- 有設定過期時間
- 瀏覽器關閉後還在

```javascript
// Session Cookie - 關閉瀏覽器就消失
res.cookie('temp', 'value')

// Persistent Cookie - 保存 7 天
res.cookie('remember', 'value', { maxAge: 7 * 24 * 60 * 60 * 1000 })
```

## 下一步

Cookie 可以儲存簡單資料，但如果要儲存複雜的用戶狀態（如購物車內容、登入資訊），我們需要 **Session**。

Session 的做法是：
- Cookie 只存一個 Session ID
- 實際資料存在伺服器端

這樣更安全，也沒有大小限制！
