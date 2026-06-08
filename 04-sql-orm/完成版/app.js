import 'dotenv/config'
import express from 'express'
import { eq, asc } from 'drizzle-orm'
import { db } from './src/db/index.js'
import { todos } from './src/db/schema.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

// 請求記錄
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - start}ms)`)
  })
  next()
})

// ---------- 路由（改用資料庫，全部變成 async）----------
// 註：在 Express 5，async 函式拋出的錯誤會自動轉交給最下面的錯誤處理 middleware，
//     所以這裡不必每個都包 try/catch。

// 取得全部
app.get('/todos', async (req, res) => {
  const all = await db.select().from(todos).orderBy(asc(todos.id))
  res.json(all)
})

// 取得單筆
app.get('/todos/:id', async (req, res) => {
  const id = Number(req.params.id)
  const [todo] = await db.select().from(todos).where(eq(todos.id, id))
  if (!todo) {
    return res.status(404).json({ error: '找不到這筆 todo' })
  }
  res.json(todo)
})

// 新增
app.post('/todos', async (req, res) => {
  const { title } = req.body
  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'title 必填，且必須是非空字串' })
  }
  const [todo] = await db.insert(todos).values({ title: title.trim() }).returning()
  res.status(201).json(todo)
})

// 部分更新
app.patch('/todos/:id', async (req, res) => {
  const id = Number(req.params.id)
  const { title, completed } = req.body

  const fields = {}
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'title 必須是非空字串' })
    }
    fields.title = title.trim()
  }
  if (completed !== undefined) {
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'completed 必須是布林值' })
    }
    fields.completed = completed
  }
  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ error: '沒有提供要更新的欄位' })
  }

  const [todo] = await db.update(todos).set(fields).where(eq(todos.id, id)).returning()
  if (!todo) {
    return res.status(404).json({ error: '找不到這筆 todo' })
  }
  res.json(todo)
})

// 刪除
app.delete('/todos/:id', async (req, res) => {
  const id = Number(req.params.id)
  const [deleted] = await db.delete(todos).where(eq(todos.id, id)).returning()
  if (!deleted) {
    return res.status(404).json({ error: '找不到這筆 todo' })
  }
  res.status(204).send()
})

// 404
app.use((req, res) => {
  res.status(404).json({ error: `找不到路徑 ${req.method} ${req.originalUrl}` })
})

// 錯誤處理（四個參數、放最後）
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || '伺服器發生錯誤' })
})

app.listen(PORT, () => {
  console.log(`伺服器啟動：http://localhost:${PORT}`)
})
