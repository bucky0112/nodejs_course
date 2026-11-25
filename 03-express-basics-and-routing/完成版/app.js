import express from 'express'

const app = express()
const PORT = process.env.PORT || 3000

// 把 JSON 請求主體解析成 req.body（第 4 堂會細講 middleware，這裡先照抄這一行）
app.use(express.json())

// ---------- 記憶體資料 ----------
// 伺服器一重啟就會清空。第 11 堂會換成真正的 PostgreSQL 資料庫。
const todos = [
  { id: 1, title: '學會 Express', completed: false, createdAt: new Date().toISOString() },
  { id: 2, title: '搞懂路由', completed: true, createdAt: new Date().toISOString() },
]
let nextId = 3

// ---------- 路由 ----------

app.get('/', (req, res) => {
  res.send('todo app 啟動成功！')
})

// 取得全部 todo；支援 query string：GET /todos?completed=true
app.get('/todos', (req, res) => {
  const { completed } = req.query // query string 的值永遠是字串
  if (completed === undefined) {
    return res.json(todos)
  }
  res.json(todos.filter((t) => String(t.completed) === completed))
})

// 取得單筆 todo：:id 是路由參數，從 req.params 拿
app.get('/todos/:id', (req, res) => {
  const id = Number(req.params.id) // 路由參數也是字串，要自己轉數字
  const todo = todos.find((t) => t.id === id)
  if (!todo) {
    return res.status(404).json({ error: '找不到這筆 todo' })
  }
  res.json(todo)
})

// 新增 todo：資料從 req.body 拿
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

app.listen(PORT, () => {
  console.log(`伺服器啟動：http://localhost:${PORT}`)
})
