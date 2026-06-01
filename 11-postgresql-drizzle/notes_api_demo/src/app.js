import express from 'express'
import cors from 'cors'
import routes from './routes/index.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

const app = express()

// 內建中間件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API 路由
app.use('/api', routes)

// 首頁
app.get('/', (req, res) => {
  res.json({
    message: 'Notes API v2',
    version: '2.0.0',
    endpoints: {
      users: '/api/users',
      notes: '/api/notes'
    }
  })
})

// 錯誤處理（放在最後！）
app.use(notFoundHandler)
app.use(errorHandler)

export default app
