import express from 'express'
import morgan from 'morgan'

const app = express()
const PORT = process.env.PORT || 3000

// ---------- 全域 middleware（由上往下依序執行）----------

// 內建：把 JSON 請求主體解析成 req.body。拿掉這行，req.body 會是 undefined
app.use(express.json())

// 第三方：morgan 記錄每個請求的方法、路徑、狀態碼與耗時
app.use(morgan('dev'))

// ---------- 自訂 middleware ----------

// 路由層級 middleware：只掛在需要的路由上，驗證不過就攔下、不呼叫 next()
const validateTitle = (req, res, next) => {
  const { title } = req.body ?? {}
  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'title 必填，且必須是非空字串' })
  }
  next()
}

// ---------- 記憶體資料 ----------
const todos = [
  { id: 1, title: '學會 Express', completed: false, createdAt: new Date().toISOString() },
  { id: 2, title: '搞懂路由', completed: true, createdAt: new Date().toISOString() },
]
let nextId = 3

// ---------- 路由 ----------

app.get('/', (req, res) => {
  res.send('todo app 啟動成功！')
})

app.get('/todos', (req, res) => {
  const { completed } = req.query
  if (completed === undefined) {
    return res.json(todos)
  }
  res.json(todos.filter((t) => String(t.completed) === completed))
})

app.get('/todos/:id', (req, res) => {
  const id = Number(req.params.id)
  const todo = todos.find((t) => t.id === id)
  if (!todo) {
    return res.status(404).json({ error: '找不到這筆 todo' })
  }
  res.json(todo)
})

// validateTitle 先跑，通過了才會進到這個 handler
app.post('/todos', validateTitle, (req, res) => {
  const todo = {
    id: nextId++,
    title: req.body.title.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  }
  todos.push(todo)
  res.status(201).json(todo)
})

// ---------- 404：放在所有路由後面，前面都沒匹配才會走到這裡 ----------
app.use((req, res) => {
  res.status(404).json({ error: `找不到路徑 ${req.method} ${req.originalUrl}` })
})

app.listen(PORT, () => {
  console.log(`伺服器啟動：http://localhost:${PORT}`)
})
