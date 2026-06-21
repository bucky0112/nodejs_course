import { eq, asc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { todos } from '../db/schema.js'
import { HttpError } from '../lib/httpError.js'

export async function listTodos() {
  return db.select().from(todos).orderBy(asc(todos.id))
}

export async function getTodo(id) {
  const [todo] = await db.select().from(todos).where(eq(todos.id, id))
  if (!todo) throw new HttpError(404, '找不到這筆 todo')
  return todo
}

export async function createTodo({ title }) {
  if (typeof title !== 'string' || title.trim() === '') {
    throw new HttpError(400, 'title 必填，且必須是非空字串')
  }
  const [todo] = await db.insert(todos).values({ title: title.trim() }).returning()
  return todo
}

export async function updateTodo(id, { title, completed }) {
  const fields = {}
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      throw new HttpError(400, 'title 必須是非空字串')
    }
    fields.title = title.trim()
  }
  if (completed !== undefined) {
    if (typeof completed !== 'boolean') {
      throw new HttpError(400, 'completed 必須是布林值')
    }
    fields.completed = completed
  }
  if (Object.keys(fields).length === 0) {
    throw new HttpError(400, '沒有提供要更新的欄位')
  }
  const [todo] = await db.update(todos).set(fields).where(eq(todos.id, id)).returning()
  if (!todo) throw new HttpError(404, '找不到這筆 todo')
  return todo
}

export async function deleteTodo(id) {
  const [deleted] = await db.delete(todos).where(eq(todos.id, id)).returning()
  if (!deleted) throw new HttpError(404, '找不到這筆 todo')
}
