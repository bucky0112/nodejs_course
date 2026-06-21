import 'dotenv/config'
import express from 'express'
import session from 'express-session'
import bcrypt from 'bcrypt'
import { eq, and, asc } from 'drizzle-orm'
import { db } from './src/db/index.js'
import { users, todos, lists, tags, todoTags } from './src/db/schema.js'
import { requireAuth } from './src/middleware/requireAuth.js'

const app = express()
const PORT = process.env.PORT || 3000

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

app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - start}ms)`)
  })
  next()
})

// ---------- 認證 ----------

// 註冊
app.post('/auth/register', async (req, res) => {
  const { username, password } = req.body
  if (typeof username !== 'string' || username.trim().length < 3) {
    return res.status(400).json({ error: 'username 至少 3 個字' })
  }
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'password 至少 6 個字' })
  }

  const existing = await db.query.users.findFirst({ where: eq(users.username, username) })
  if (existing) {
    return res.status(409).json({ error: '這個 username 已被註冊' })
  }

  // 雜湊密碼後才存（10 是 cost factor）
  const passwordHash = await bcrypt.hash(password, 10)
  const [user] = await db
    .insert(users)
    .values({ username, passwordHash })
    .returning({ id: users.id, username: users.username })

  req.session.userId = user.id // 註冊完直接登入
  res.status(201).json(user)
})

// 登入
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body
  const user = await db.query.users.findFirst({ where: eq(users.username, username) })

  // 不論「帳號不存在」或「密碼錯」都回同樣的訊息，避免洩漏哪個帳號存在
  if (!user || !(await bcrypt.compare(password ?? '', user.passwordHash))) {
    return res.status(401).json({ error: '帳號或密碼錯誤' })
  }

  req.session.userId = user.id
  res.json({ id: user.id, username: user.username })
})

// 登出
app.post('/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid')
    res.status(204).send()
  })
})

// 我是誰
app.get('/auth/me', requireAuth, async (req, res) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, req.session.userId),
    columns: { id: true, username: true },
  })
  res.json(user)
})

// ---------- todos（全部需登入，且只看得到自己的）----------

app.get('/todos', requireAuth, async (req, res) => {
  const rows = await db.query.todos.findMany({
    where: eq(todos.userId, req.session.userId),
    with: { list: true, todoTags: { with: { tag: true } } },
    orderBy: asc(todos.id),
  })
  res.json(rows.map(shapeTodo))
})

app.get('/todos/:id', requireAuth, async (req, res) => {
  const todo = await loadOwnedTodo(req)
  if (!todo) return res.status(404).json({ error: '找不到這筆 todo' })
  res.json(shapeTodo(todo))
})

app.post('/todos', requireAuth, async (req, res) => {
  const { title, listId } = req.body
  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'title 必填，且必須是非空字串' })
  }
  if (listId !== undefined && listId !== null) {
    const list = await db.query.lists.findFirst({ where: eq(lists.id, Number(listId)) })
    if (!list) return res.status(400).json({ error: '指定的 listId 不存在' })
  }
  const [todo] = await db
    .insert(todos)
    .values({ title: title.trim(), listId: listId ?? null, userId: req.session.userId })
    .returning()
  res.status(201).json(todo)
})

app.patch('/todos/:id', requireAuth, async (req, res) => {
  const owned = await loadOwnedTodo(req)
  if (!owned) return res.status(404).json({ error: '找不到這筆 todo' })

  const { title, completed, listId } = req.body
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
  if (listId !== undefined) {
    if (listId !== null) {
      const list = await db.query.lists.findFirst({ where: eq(lists.id, Number(listId)) })
      if (!list) return res.status(400).json({ error: '指定的 listId 不存在' })
    }
    fields.listId = listId
  }
  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ error: '沒有提供要更新的欄位' })
  }

  const [todo] = await db.update(todos).set(fields).where(eq(todos.id, owned.id)).returning()
  res.json(todo)
})

app.delete('/todos/:id', requireAuth, async (req, res) => {
  const owned = await loadOwnedTodo(req)
  if (!owned) return res.status(404).json({ error: '找不到這筆 todo' })
  await db.delete(todos).where(eq(todos.id, owned.id))
  res.status(204).send()
})

// ---------- lists / tags（需登入；此版暫為共用）----------

app.get('/lists', requireAuth, async (req, res) => {
  res.json(await db.select().from(lists).orderBy(asc(lists.id)))
})
app.post('/lists', requireAuth, async (req, res) => {
  const { name } = req.body
  if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'name 必填' })
  }
  const [list] = await db.insert(lists).values({ name: name.trim() }).returning()
  res.status(201).json(list)
})

app.get('/tags', requireAuth, async (req, res) => {
  res.json(await db.select().from(tags).orderBy(asc(tags.id)))
})
app.post('/tags', requireAuth, async (req, res) => {
  const { name } = req.body
  if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'name 必填' })
  }
  const [tag] = await db.insert(tags).values({ name: name.trim() }).returning()
  res.status(201).json(tag)
})

app.post('/todos/:id/tags', requireAuth, async (req, res) => {
  const owned = await loadOwnedTodo(req)
  if (!owned) return res.status(404).json({ error: '找不到這筆 todo' })
  const { tagId } = req.body
  const tag = await db.query.tags.findFirst({ where: eq(tags.id, Number(tagId)) })
  if (!tag) return res.status(404).json({ error: '找不到這個標籤' })
  await db.insert(todoTags).values({ todoId: owned.id, tagId: Number(tagId) }).onConflictDoNothing()
  res.status(201).json({ todoId: owned.id, tagId: Number(tagId) })
})

app.delete('/todos/:id/tags/:tagId', requireAuth, async (req, res) => {
  const owned = await loadOwnedTodo(req)
  if (!owned) return res.status(404).json({ error: '找不到這筆 todo' })
  const tagId = Number(req.params.tagId)
  const [removed] = await db
    .delete(todoTags)
    .where(and(eq(todoTags.todoId, owned.id), eq(todoTags.tagId, tagId)))
    .returning()
  if (!removed) return res.status(404).json({ error: '這個 todo 沒有這個標籤' })
  res.status(204).send()
})

// ---------- 小工具 ----------

// 載入「屬於目前登入者」的 todo；不是自己的就回 undefined（不洩漏存在與否）
async function loadOwnedTodo(req) {
  const id = Number(req.params.id)
  const todo = await db.query.todos.findFirst({
    where: and(eq(todos.id, id), eq(todos.userId, req.session.userId)),
    with: { list: true, todoTags: { with: { tag: true } } },
  })
  return todo
}

function shapeTodo(todo) {
  const { todoTags: links, userId, ...rest } = todo
  return { ...rest, tags: (links ?? []).map((l) => l.tag) }
}

// ---------- 收尾 ----------

app.use((req, res) => {
  res.status(404).json({ error: `找不到路徑 ${req.method} ${req.originalUrl}` })
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || '伺服器發生錯誤' })
})

app.listen(PORT, () => {
  console.log(`伺服器啟動：http://localhost:${PORT}`)
})
