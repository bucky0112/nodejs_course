import 'dotenv/config' // 必須最先載入，讓 db 連線拿得到 DATABASE_URL
import express from 'express'
import cookieParser from 'cookie-parser'
import { routes } from './routes/index.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

export const app = express()

app.use(express.json())
app.use(cookieParser()) // 讓我們能用 req.cookies 讀 cookie（OAuth state 要用）

// JWT 是無狀態的：不需要 session middleware，認證狀態由每個請求自帶的 token 表達。

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
// multer 的錯誤（檔案太大、非圖片）也在 errorHandler 統一處理。
app.use(errorHandler)
