import express from 'express'

const app = express()
const PORT = process.env.PORT || 3000

// ---------- 中介軟體（middleware）----------

// 內建：把 JSON 請求主體解析成 req.body（沒有這行 req.body 會是 undefined）
app.use(express.json())

// 自訂：記錄每個請求的方法、路徑、狀態碼與耗時
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - start}ms)`)
  })
  next()
})

// ---------- 記憶體資料 ----------
// 注意：這是存在記憶體裡的，伺服器一重啟就會清空。
// 下一章（M2）會把它換成真正的 PostgreSQL 資料庫。
let todos = [
  { id: 1, title: '學會 Express', completed: false, createdAt: new Date().toISOString() },
]
let nextId = 2

// ---------- 路由 ----------

// 取得全部 todo
app.get('/todos', (req, res) => {
  res.json(todos)
})

// 取得單筆 todo
app.get('/todos/:id', (req, res) => {
  const id = Number(req.params.id)
  const todo = todos.find((t) => t.id === id)
  if (!todo) {
    return res.status(404).json({ error: '找不到這筆 todo' })
  }
  res.json(todo)
})

// 新增 todo
app.post('/todos', (req, res) => {
  const { title } = req.body
  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'title 必填，且必須是非空字串' })
  }

  const todo = {
    id: nextId++,
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  }
  todos.push(todo)
  res.status(201).json(todo)
})

// 部分更新 todo（PATCH：只改有送來的欄位）
app.patch('/todos/:id', (req, res) => {
  const id = Number(req.params.id)
  const todo = todos.find((t) => t.id === id)
  if (!todo) {
    return res.status(404).json({ error: '找不到這筆 todo' })
  }

  const { title, completed } = req.body

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'title 必須是非空字串' })
    }
    todo.title = title.trim()
  }

  if (completed !== undefined) {
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'completed 必須是布林值' })
    }
    todo.completed = completed
  }

  res.json(todo)
})

// 刪除 todo
app.delete('/todos/:id', (req, res) => {
  const id = Number(req.params.id)
  const exists = todos.some((t) => t.id === id)
  if (!exists) {
    return res.status(404).json({ error: '找不到這筆 todo' })
  }
  todos = todos.filter((t) => t.id !== id)
  res.status(204).send()
})

// ---------- 404：沒有任何路由匹配時 ----------
app.use((req, res) => {
  res.status(404).json({ error: `找不到路徑 ${req.method} ${req.originalUrl}` })
})

// ---------- 錯誤處理 middleware（四個參數、放最後）----------
// 詳見 concepts/express-錯誤處理.md
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || '伺服器發生錯誤' })
})

app.listen(PORT, () => {
  console.log(`伺服器啟動：http://localhost:${PORT}`)
})
