import 'dotenv/config'
import crypto from 'node:crypto'
import express from 'express'
import cookieParser from 'cookie-parser'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { eq, and, asc } from 'drizzle-orm'
import { db } from './src/db/index.js'
import { users, todos, lists, tags, todoTags } from './src/db/schema.js'
import { requireAuth } from './src/middleware/requireAuth.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cookieParser()) // 讓我們能用 req.cookies 讀 cookie（OAuth state 要用）

app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - start}ms)`)
  })
  next()
})

function signToken(userId) {
  return jwt.sign({ sub: String(userId) }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '7d',
  })
}

// ===================================================================
// 帳號密碼認證（沿用 M5）
// ===================================================================

app.post('/auth/register', async (req, res) => {
  const { username, password } = req.body
  if (typeof username !== 'string' || username.trim().length < 3) {
    return res.status(400).json({ error: 'username 至少 3 個字' })
  }
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'password 至少 6 個字' })
  }
  const existing = await db.query.users.findFirst({ where: eq(users.username, username) })
  if (existing) return res.status(409).json({ error: '這個 username 已被註冊' })

  const passwordHash = await bcrypt.hash(password, 10)
  const [user] = await db
    .insert(users)
    .values({ username, passwordHash })
    .returning({ id: users.id, username: users.username })
  res.status(201).json({ token: signToken(user.id), user })
})

app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body
  const user = await db.query.users.findFirst({ where: eq(users.username, username) })
  // 注意：用 Google 註冊的人沒有 passwordHash，bcrypt.compare 對 null 會失敗（正確地擋下）
  if (!user || !user.passwordHash || !(await bcrypt.compare(password ?? '', user.passwordHash))) {
    return res.status(401).json({ error: '帳號或密碼錯誤' })
  }
  res.json({ token: signToken(user.id), user: { id: user.id, username: user.username } })
})

// ===================================================================
// Google OAuth（Authorization Code Flow，手刻）
// ===================================================================

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'

// 第 1 步：把使用者導去 Google 授權頁
app.get('/auth/google', (req, res) => {
  // 產生隨機 state，存進短期 httpOnly cookie；回呼時用來比對，防 CSRF
  const state = crypto.randomBytes(16).toString('hex')
  res.cookie('oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 5 * 60 * 1000, // 5 分鐘
  })

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    state,
  })
  res.redirect(`${GOOGLE_AUTH_URL}?${params}`)
})

// 第 2 步：Google 授權後導回這裡（帶 code 與 state）
app.get('/auth/google/callback', async (req, res) => {
  const { code, state } = req.query

  // 防 CSRF：回傳的 state 必須跟我們先前存進 cookie 的一致
  if (!state || state !== req.cookies.oauth_state) {
    return res.status(403).json({ error: 'state 不符，拒絕（可能是 CSRF 攻擊）' })
  }
  res.clearCookie('oauth_state')

  if (!code) return res.status(400).json({ error: '缺少授權碼 code' })

  // 第 3 步：拿 code 去跟 Google 換 access token（後端對後端，client_secret 不外露）
  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  })
  if (!tokenRes.ok) return res.status(401).json({ error: '用 code 換 token 失敗' })
  const { access_token } = await tokenRes.json()

  // 第 4 步：用 access token 取得使用者基本資料
  const infoRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${access_token}` },
  })
  if (!infoRes.ok) return res.status(401).json({ error: '取得使用者資訊失敗' })
  const profile = await infoRes.json() // { id, email, name, picture, ... }

  // 第 5 步：找或建立使用者（用 googleId 當識別）
  let user = await db.query.users.findFirst({ where: eq(users.googleId, profile.id) })
  if (!user) {
    ;[user] = await db
      .insert(users)
      .values({ username: profile.email, googleId: profile.id })
      .returning({ id: users.id, username: users.username })
  }

  // 第 6 步：簽發「我們自己的」JWT。
  // 重要：不要像某些教學那樣把 user 資料塞進 URL query string（會留在瀏覽器歷史/log）。
  // 正式環境會把 token 設成 httpOnly cookie，或交給前端安全保存；這裡為示範直接回 JSON。
  const token = signToken(user.id)
  res.json({ token, user })
})

// 我是誰
app.get('/auth/me', requireAuth, async (req, res) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, req.userId),
    columns: { id: true, username: true },
  })
  res.json(user)
})

// ===================================================================
// todos / lists / tags（需 token、只看得到自己的；同 M5）
// ===================================================================

app.get('/todos', requireAuth, async (req, res) => {
  const rows = await db.query.todos.findMany({
    where: eq(todos.userId, req.userId),
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
    .values({ title: title.trim(), listId: listId ?? null, userId: req.userId })
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

async function loadOwnedTodo(req) {
  const id = Number(req.params.id)
  return db.query.todos.findFirst({
    where: and(eq(todos.id, id), eq(todos.userId, req.userId)),
    with: { list: true, todoTags: { with: { tag: true } } },
  })
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
