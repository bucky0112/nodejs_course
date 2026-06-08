import 'dotenv/config'
import crypto from 'node:crypto'
import path from 'node:path'
import express from 'express'
import cookieParser from 'cookie-parser'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { eq, and, asc } from 'drizzle-orm'
import { db } from './src/db/index.js'
import { users, todos, lists, tags, todoTags } from './src/db/schema.js'
import { requireAuth } from './src/middleware/requireAuth.js'
import { s3, BUCKET } from './src/config/s3.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cookieParser())

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

// ---------- multer：檔案上傳設定 ----------
// memoryStorage：檔案放在記憶體 buffer，直接串流上 S3，不落地暫存檔。
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    // 注意：mimetype 是瀏覽器送的、可被偽造，這只是第一道過濾。
    // 高安全需求應再驗證檔案實際內容（magic bytes）。
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('只接受圖片檔'))
    }
    cb(null, true)
  },
})

// ===================================================================
// 帳號密碼 / Google OAuth 認證（同 M6）
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
  if (!user || !user.passwordHash || !(await bcrypt.compare(password ?? '', user.passwordHash))) {
    return res.status(401).json({ error: '帳號或密碼錯誤' })
  }
  res.json({ token: signToken(user.id), user: { id: user.id, username: user.username } })
})

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'

app.get('/auth/google', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex')
  res.cookie('oauth_state', state, { httpOnly: true, sameSite: 'lax', maxAge: 5 * 60 * 1000 })
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    state,
  })
  res.redirect(`${GOOGLE_AUTH_URL}?${params}`)
})

app.get('/auth/google/callback', async (req, res) => {
  const { code, state } = req.query
  if (!state || state !== req.cookies.oauth_state) {
    return res.status(403).json({ error: 'state 不符（可能是 CSRF）' })
  }
  res.clearCookie('oauth_state')
  if (!code) return res.status(400).json({ error: '缺少授權碼 code' })

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

  const infoRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${access_token}` },
  })
  if (!infoRes.ok) return res.status(401).json({ error: '取得使用者資訊失敗' })
  const profile = await infoRes.json()

  let user = await db.query.users.findFirst({ where: eq(users.googleId, profile.id) })
  if (!user) {
    ;[user] = await db
      .insert(users)
      .values({ username: profile.email, googleId: profile.id })
      .returning({ id: users.id, username: users.username })
  }
  res.json({ token: signToken(user.id), user })
})

app.get('/auth/me', requireAuth, async (req, res) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, req.userId),
    columns: { id: true, username: true, avatarKey: true },
  })
  res.json(user)
})

// ===================================================================
// 頭像上傳（這章的新內容）
// ===================================================================

// 上傳 / 更新頭像
app.post('/me/avatar', requireAuth, upload.single('avatar'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '請上傳一張圖片（form-data 欄位名為 avatar）' })
  }

  // 用隨機檔名，不要信任使用者的原始檔名（可能含路徑或特殊字元）
  const ext = path.extname(req.file.originalname).toLowerCase() || '.img'
  const key = `avatars/${req.userId}/${crypto.randomUUID()}${ext}`

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }),
  )

  await db.update(users).set({ avatarKey: key }).where(eq(users.id, req.userId))
  res.status(201).json({ avatarKey: key })
})

// 取得頭像：產生短期 presigned URL（bucket 設為私有，不公開直連）
app.get('/me/avatar', requireAuth, async (req, res) => {
  const user = await db.query.users.findFirst({ where: eq(users.id, req.userId) })
  if (!user?.avatarKey) {
    return res.status(404).json({ error: '還沒有上傳頭像' })
  }
  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET, Key: user.avatarKey }),
    { expiresIn: 300 }, // 5 分鐘有效
  )
  res.json({ url })
})

// ===================================================================
// todos / lists / tags（同 M6）
// ===================================================================

app.get('/todos', requireAuth, async (req, res) => {
  const rows = await db.query.todos.findMany({
    where: eq(todos.userId, req.userId),
    with: { list: true, todoTags: { with: { tag: true } } },
    orderBy: asc(todos.id),
  })
  res.json(rows.map(shapeTodo))
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

app.get('/todos/:id', requireAuth, async (req, res) => {
  const todo = await loadOwnedTodo(req)
  if (!todo) return res.status(404).json({ error: '找不到這筆 todo' })
  res.json(shapeTodo(todo))
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
  // multer 的檔案大小超限
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: '檔案太大（上限 2MB）' })
    }
    return res.status(400).json({ error: err.message })
  }
  // fileFilter 丟出的「只接受圖片檔」等錯誤
  if (err.message === '只接受圖片檔') {
    return res.status(400).json({ error: err.message })
  }
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || '伺服器發生錯誤' })
})

app.listen(PORT, () => {
  console.log(`伺服器啟動：http://localhost:${PORT}`)
})
