# Session vs JWT：如何選擇？

## 兩種認證方式的比較

### Session-based（有狀態）

```
┌────────┐      ┌────────┐      ┌─────────────┐
│ 瀏覽器  │ ───▶ │ 伺服器  │ ───▶ │ Session Store│
│        │      │        │      │ (Redis/DB)  │
│ Cookie:│ ◀─── │ 查詢   │ ◀─── │             │
│ sid=.. │      │ Session │      │ sid: {...}  │
└────────┘      └────────┘      └─────────────┘
```

### Token-based / JWT（無狀態）

```
┌────────┐      ┌────────┐
│ 瀏覽器  │ ───▶ │ 伺服器  │
│        │      │        │
│ Header:│ ◀─── │ 驗證    │  ← 不需要查詢資料庫
│ JWT=.. │      │ 簽名    │
└────────┘      └────────┘
```

## 完整比較表

| 比較項目 | Session | JWT |
|---------|---------|-----|
| **狀態** | 有狀態（Stateful） | 無狀態（Stateless） |
| **儲存位置** | 伺服器端 | 客戶端（瀏覽器） |
| **擴展性** | 需要共享 Session Store | 任何伺服器都能驗證 |
| **效能** | 每次都要查詢 Store | 只需驗證簽名 |
| **撤銷能力** | 可以立即撤銷 | 難以立即撤銷 |
| **資料大小** | 無限制 | 建議 < 8KB |
| **安全風險** | Session 劫持 | Token 洩露 |
| **適合場景** | 傳統網站、管理後台 | API、微服務、行動 App |

## 認證流程對比

### Session 流程

```
1. 用戶登入
   POST /login { username, password }

2. 伺服器驗證成功
   - 建立 Session，存入 Session Store
   - 回傳 Set-Cookie: sid=abc123

3. 後續請求
   - 瀏覽器自動帶 Cookie: sid=abc123
   - 伺服器查詢 Session Store
   - 取得用戶資料

4. 登出
   - 伺服器刪除 Session
   - 清除 Cookie
```

### JWT 流程

```
1. 用戶登入
   POST /login { username, password }

2. 伺服器驗證成功
   - 產生 JWT（包含用戶資訊 + 簽名）
   - 回傳 { token: "eyJhbG..." }

3. 後續請求
   - 前端帶 Header: Authorization: Bearer eyJhbG...
   - 伺服器驗證簽名
   - 從 JWT 取得用戶資料（不需查資料庫）

4. 登出
   - 前端刪除 Token
   - 伺服器無法主動撤銷（除非用黑名單）
```

## 何時選 Session？

**推薦情境：**

1. **傳統 Server-Side Rendered 網站**
   - 用 EJS、Pug 等模板引擎
   - 頁面由伺服器產生

2. **需要即時撤銷權限**
   - 管理員踢掉用戶
   - 修改密碼後強制登出其他裝置

3. **單一伺服器或已有 Redis**
   - 不用擔心 Session 共享問題

4. **敏感操作的管理後台**
   - 更嚴格的控制權

```javascript
// Session 適合：踢掉用戶很容易
app.post('/admin/kick-user/:id', async (req, res) => {
  await sessionStore.destroy(`user:${req.params.id}`)
  res.json({ message: '用戶已被踢出' })
})
```

## 何時選 JWT？

**推薦情境：**

1. **前後端分離的 SPA**
   - React、Vue、Angular
   - API 獨立部署

2. **微服務架構**
   - 多個服務需要驗證同一個用戶
   - 避免每個服務都查 Session Store

3. **行動 App**
   - 原生 App 處理 Cookie 較麻煩
   - Token 儲存在 App 內

4. **第三方 API**
   - 讓其他服務使用你的 API
   - 容易實作 OAuth

```javascript
// JWT 適合：微服務之間傳遞身份
// 服務 A 產生的 Token，服務 B 可以直接驗證
const decoded = jwt.verify(token, SECRET_KEY)
// 不需要查詢任何資料庫！
```

## 混合使用

實務上可以混合使用：

```javascript
// 網頁用 Session（httpOnly Cookie 更安全）
app.use('/web', session({ ... }))

// API 用 JWT（給 App 和第三方使用）
app.use('/api', jwtMiddleware)
```

## JWT 的撤銷問題

JWT 最大的問題是**無法立即撤銷**。解決方案：

### 1. 短期 Token + Refresh Token

```javascript
// Access Token：15 分鐘
const accessToken = jwt.sign(payload, SECRET, { expiresIn: '15m' })

// Refresh Token：7 天（存在資料庫，可撤銷）
const refreshToken = generateRefreshToken()
await db.insert(refreshTokensTable).values({
  token: refreshToken,
  userId: user.id,
  expiresAt: addDays(new Date(), 7)
})
```

### 2. Token 黑名單

```javascript
// 登出時加入黑名單
app.post('/logout', async (req, res) => {
  await redis.set(`blacklist:${token}`, 1, 'EX', tokenRemainingTime)
  res.json({ message: '已登出' })
})

// 驗證時檢查黑名單
const isBlacklisted = await redis.get(`blacklist:${token}`)
if (isBlacklisted) throw new Error('Token 已失效')
```

## 總結

| 你的情況 | 建議 |
|---------|------|
| 傳統網站 + 管理後台 | Session |
| SPA + REST API | JWT |
| 微服務架構 | JWT |
| 需要即時撤銷 | Session 或 JWT + 黑名單 |
| 兩者都需要 | 混合使用 |

**沒有絕對的好壞，選擇適合你專案的方案！**
