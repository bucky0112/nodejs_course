import 'dotenv/config' // 必須最先載入，讓 db 連線拿得到 DATABASE_URL
import express from 'express'
import session from 'express-session'
import { routes } from './routes/index.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

export const app = express()

app.use(express.json())

// ---------- Session ----------
app.use(
  session({
    secret: process.env.SESSION_SECRET, // 一定從環境變數來，絕不硬編
    resave: false,
    saveUninitialized: false, // 沒登入的訪客不建立 session
    cookie: {
      httpOnly: true, // 讓瀏覽器 JS 讀不到這個 cookie（降低 XSS 被竊風險）
      secure: process.env.NODE_ENV === 'production', // 正式環境走 HTTPS 才設 true
      sameSite: 'lax', // 緩解 CSRF
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 天
    },
    // 註：預設用記憶體存 session，重啟就清空、也無法多台機器共用。
    //     正式環境請改用持久化 store（如 connect-pg-simple 存進 PostgreSQL）。
  }),
)

// 請求紀錄
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - start}ms)`)
  })
  next()
})

app.use(routes)

app.use(notFound)
// service 拋出的 HttpError 會被 Express 5 自動接住（async handler 的 rejected promise）並轉送到這裡，
// 所以 controller 不需要自己寫 try/catch。
app.use(errorHandler)
