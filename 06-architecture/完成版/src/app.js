import 'dotenv/config' // 必須最先載入，讓 db 連線拿得到 DATABASE_URL
import express from 'express'
import { routes } from './routes/index.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

export const app = express()

app.use(express.json())

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
app.use(errorHandler)
