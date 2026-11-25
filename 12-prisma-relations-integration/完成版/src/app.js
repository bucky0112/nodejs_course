// app.js 負責「組裝」：建立 app、掛 middleware 與路由，但不呼叫 listen。
// 這樣測試（第 8 堂）可以直接 import app，不用真的開 port。
import express from 'express'
import morgan from 'morgan'
import { routes } from './routes/index.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

export const app = express()

app.use(express.json())
// 跑測試時（vitest 會把 NODE_ENV 設成 'test'）不印請求記錄，輸出比較乾淨
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

app.use(routes)

app.use(notFound)
app.use(errorHandler) // 一定放最後
