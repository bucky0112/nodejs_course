import 'dotenv/config'
import express from 'express'
import { eq, and, asc } from 'drizzle-orm'
import { db } from './src/db/index.js'
import { todos, lists, tags, todoTags } from './src/db/schema.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - start}ms)`)
  })
  next()
})

// 把 Query API 撈出來的 todo 整理成乾淨格式：
// 把 todoTags: [{ tag }] 攤平成 tags: [tag]
function shapeTodo(todo) {
  const { todoTags: links, ...rest } = todo
  return { ...rest, tags: (links ?? []).map((l) => l.tag) }
}

// ---------- todos（含關聯）----------

// 取得全部 todo，連同它的清單與標籤
app.get('/todos', async (req, res) => {
  const rows = await db.query.todos.findMany({
    with: {
      list: true,
      todoTags: { with: { tag: true } },
    },
    orderBy: asc(todos.id),
  })
  res.json(rows.map(shapeTodo))
})

// 取得單筆 todo（含關聯）
app.get('/todos/:id', async (req, res) => {
  const id = Number(req.params.id)
  const todo = await db.query.todos.findFirst({
    where: eq(todos.id, id),
    with: {
      list: true,
      todoTags: { with: { tag: true } },
    },
  })
  if (!todo) {
    return res.status(404).json({ error: '找不到這筆 todo' })
  }
  res.json(shapeTodo(todo))
})

// 新增 todo（可選擇歸到某個清單）
app.post('/todos', async (req, res) => {
  const { title, listId } = req.body
  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'title 必填，且必須是非空字串' })
  }
  if (listId !== undefined && listId !== null) {
    const list = await db.query.lists.findFirst({ where: eq(lists.id, Number(listId)) })
    if (!list) {
      return res.status(400).json({ error: '指定的 listId 不存在' })
    }
  }
  const [todo] = await db
    .insert(todos)
    .values({ title: title.trim(), listId: listId ?? null })
    .returning()
  res.status(201).json(todo)
})

// 更新 todo（title / completed / listId）
app.patch('/todos/:id', async (req, res) => {
  const id = Number(req.params.id)
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
      if (!list) {
        return res.status(400).json({ error: '指定的 listId 不存在' })
      }
    }
    fields.listId = listId
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

// 刪除 todo（中介表的關聯會因 ON DELETE CASCADE 自動清掉）
app.delete('/todos/:id', async (req, res) => {
  const id = Number(req.params.id)
  const [deleted] = await db.delete(todos).where(eq(todos.id, id)).returning()
  if (!deleted) {
    return res.status(404).json({ error: '找不到這筆 todo' })
  }
  res.status(204).send()
})

// ---------- lists（1:N 的「一」邊）----------

app.get('/lists', async (req, res) => {
  const all = await db.select().from(lists).orderBy(asc(lists.id))
  res.json(all)
})

app.post('/lists', async (req, res) => {
  const { name } = req.body
  if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'name 必填' })
  }
  const [list] = await db.insert(lists).values({ name: name.trim() }).returning()
  res.status(201).json(list)
})

// ---------- tags（M:N）----------

app.get('/tags', async (req, res) => {
  const all = await db.select().from(tags).orderBy(asc(tags.id))
  res.json(all)
})

app.post('/tags', async (req, res) => {
  const { name } = req.body
  if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'name 必填' })
  }
  const [tag] = await db.insert(tags).values({ name: name.trim() }).returning()
  res.status(201).json(tag)
})

// 幫 todo 貼上一個標籤（在中介表新增一列）
app.post('/todos/:id/tags', async (req, res) => {
  const todoId = Number(req.params.id)
  const { tagId } = req.body

  const todo = await db.query.todos.findFirst({ where: eq(todos.id, todoId) })
  if (!todo) return res.status(404).json({ error: '找不到這筆 todo' })

  const tag = await db.query.tags.findFirst({ where: eq(tags.id, Number(tagId)) })
  if (!tag) return res.status(404).json({ error: '找不到這個標籤' })

  // onConflictDoNothing：同一組 (todo, tag) 已存在就不重複貼
  await db.insert(todoTags).values({ todoId, tagId: Number(tagId) }).onConflictDoNothing()
  res.status(201).json({ todoId, tagId: Number(tagId) })
})

// 把某個標籤從 todo 上撕掉（刪中介表那一列）
app.delete('/todos/:id/tags/:tagId', async (req, res) => {
  const todoId = Number(req.params.id)
  const tagId = Number(req.params.tagId)
  // M:N 中介表用複合主鍵，刪除時要「兩個欄位都比對」才精準
  const [removed] = await db
    .delete(todoTags)
    .where(and(eq(todoTags.todoId, todoId), eq(todoTags.tagId, tagId)))
    .returning()
  if (!removed) {
    return res.status(404).json({ error: '這個 todo 沒有這個標籤' })
  }
  res.status(204).send()
})

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
