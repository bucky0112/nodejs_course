import express from 'express'
import session from 'express-session'
import cookieParser from 'cookie-parser'

const app = express()

// ============================================
// Middleware 設定
// ============================================

app.use(express.json())
app.use(cookieParser())

// Session 設定
app.use(session({
  secret: 'your-super-secret-key',  // 正式環境請用環境變數
  name: 'sessionId',                 // Cookie 名稱
  resave: false,                     // 沒變更時不重新儲存
  saveUninitialized: false,          // 不儲存空的 Session
  cookie: {
    maxAge: 60 * 60 * 1000,          // 1 小時
    httpOnly: true,                   // 禁止 JavaScript 存取
    secure: false                     // 開發環境用 false
  }
}))

// ============================================
// 模擬用戶資料（實際專案請用資料庫）
// ============================================

const users = [
  { id: 1, username: 'john', password: '1234', role: 'admin' },
  { id: 2, username: 'jane', password: '5678', role: 'user' }
]

// ============================================
// 驗證 Middleware
// ============================================

const requireAuth = (req, res, next) => {
  if (req.session.user) {
    next()
  } else {
    res.status(401).json({ message: '請先登入' })
  }
}

const requireAdmin = (req, res, next) => {
  if (req.session.user?.role === 'admin') {
    next()
  } else {
    res.status(403).json({ message: '需要管理員權限' })
  }
}

// ============================================
// Cookie 範例路由
// ============================================

// 設定 Cookie
app.get('/cookie/set', (req, res) => {
  res.cookie('visitor', 'hello-world', {
    maxAge: 24 * 60 * 60 * 1000,  // 1 天
    httpOnly: true
  })
  res.json({ message: 'Cookie 已設定！' })
})

// 讀取 Cookie
app.get('/cookie/get', (req, res) => {
  res.json({
    cookies: req.cookies,
    message: req.cookies.visitor ? `Cookie 值: ${req.cookies.visitor}` : '沒有找到 Cookie'
  })
})

// 刪除 Cookie
app.get('/cookie/clear', (req, res) => {
  res.clearCookie('visitor')
  res.json({ message: 'Cookie 已清除！' })
})

// ============================================
// Session 認證路由
// ============================================

// 登入
app.post('/login', (req, res) => {
  const { username, password } = req.body

  const user = users.find(u => u.username === username && u.password === password)

  if (user) {
    // 將用戶資訊存入 Session（不要存密碼！）
    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role
    }
    res.json({
      message: '登入成功',
      user: req.session.user
    })
  } else {
    res.status(401).json({ message: '帳號或密碼錯誤' })
  }
})

// 檢查登入狀態
app.get('/me', (req, res) => {
  if (req.session.user) {
    res.json({
      loggedIn: true,
      user: req.session.user
    })
  } else {
    res.json({
      loggedIn: false,
      message: '尚未登入'
    })
  }
})

// 登出
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: '登出失敗' })
    }
    res.clearCookie('sessionId')
    res.json({ message: '已登出' })
  })
})

// ============================================
// 受保護的路由範例
// ============================================

// 需要登入才能存取
app.get('/profile', requireAuth, (req, res) => {
  res.json({
    message: `歡迎，${req.session.user.username}！`,
    user: req.session.user
  })
})

// 需要管理員權限
app.get('/admin/dashboard', requireAuth, requireAdmin, (req, res) => {
  res.json({
    message: '歡迎來到管理員儀表板',
    stats: {
      totalUsers: users.length,
      activeSession: '你目前的 Session'
    }
  })
})

// ============================================
// 購物車範例（Session 應用）
// ============================================

// 查看購物車
app.get('/cart', (req, res) => {
  const cart = req.session.cart || []
  res.json({ cart, total: cart.length })
})

// 加入購物車
app.post('/cart/add', (req, res) => {
  const { item } = req.body

  if (!req.session.cart) {
    req.session.cart = []
  }

  req.session.cart.push({
    id: Date.now(),
    name: item,
    addedAt: new Date()
  })

  res.json({
    message: `已將 ${item} 加入購物車`,
    cart: req.session.cart
  })
})

// 清空購物車
app.delete('/cart', (req, res) => {
  req.session.cart = []
  res.json({ message: '購物車已清空' })
})

// ============================================
// 啟動伺服器
// ============================================

const PORT = 3000

app.listen(PORT, () => {
  console.log(`伺服器已啟動：http://localhost:${PORT}`)
  console.log('')
  console.log('=== Cookie 測試 ===')
  console.log('GET  /cookie/set   - 設定 Cookie')
  console.log('GET  /cookie/get   - 讀取 Cookie')
  console.log('GET  /cookie/clear - 刪除 Cookie')
  console.log('')
  console.log('=== Session 認證 ===')
  console.log('POST /login        - 登入 (body: { username, password })')
  console.log('GET  /me           - 檢查登入狀態')
  console.log('POST /logout       - 登出')
  console.log('GET  /profile      - 個人資料（需登入）')
  console.log('GET  /admin/dashboard - 管理員儀表板（需 admin）')
  console.log('')
  console.log('=== 購物車 ===')
  console.log('GET    /cart       - 查看購物車')
  console.log('POST   /cart/add   - 加入商品 (body: { item })')
  console.log('DELETE /cart       - 清空購物車')
  console.log('')
  console.log('測試帳號：')
  console.log('  admin: john / 1234')
  console.log('  user:  jane / 5678')
})
