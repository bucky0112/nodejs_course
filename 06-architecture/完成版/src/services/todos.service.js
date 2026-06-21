import { eq, and, asc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { todos, lists, tags, todoTags } from '../db/schema.js'
import { HttpError } from '../lib/httpError.js'

// 把 Query API 撈出來的 todo 整理成乾淨格式：todoTags:[{tag}] → tags:[tag]
function shapeTodo(todo) {
  const { todoTags: links, ...rest } = todo
  return { ...rest, tags: (links ?? []).map((l) => l.tag) }
}

export async function listTodos() {
  const rows = await db.query.todos.findMany({
    with: { list: true, todoTags: { with: { tag: true } } },
    orderBy: asc(todos.id),
  })
  return rows.map(shapeTodo)
}

export async function getTodo(id) {
  const todo = await db.query.todos.findFirst({
    where: eq(todos.id, id),
    with: { list: true, todoTags: { with: { tag: true } } },
  })
  if (!todo) throw new HttpError(404, '找不到這筆 todo')
  return shapeTodo(todo)
}

export async function createTodo({ title, listId }) {
  if (typeof title !== 'string' || title.trim() === '') {
    throw new HttpError(400, 'title 必填，且必須是非空字串')
  }
  if (listId !== undefined && listId !== null) {
    const list = await db.query.lists.findFirst({ where: eq(lists.id, Number(listId)) })
    if (!list) throw new HttpError(400, '指定的 listId 不存在')
  }
  const [todo] = await db
    .insert(todos)
    .values({ title: title.trim(), listId: listId ?? null })
    .returning()
  return todo
}

export async function updateTodo(id, { title, completed, listId }) {
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
  if (listId !== undefined) {
    if (listId !== null) {
      const list = await db.query.lists.findFirst({ where: eq(lists.id, Number(listId)) })
      if (!list) throw new HttpError(400, '指定的 listId 不存在')
    }
    fields.listId = listId
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

export async function addTagToTodo(todoId, tagId) {
  const todo = await db.query.todos.findFirst({ where: eq(todos.id, todoId) })
  if (!todo) throw new HttpError(404, '找不到這筆 todo')
  const tag = await db.query.tags.findFirst({ where: eq(tags.id, Number(tagId)) })
  if (!tag) throw new HttpError(404, '找不到這個標籤')
  await db.insert(todoTags).values({ todoId, tagId: Number(tagId) }).onConflictDoNothing()
  return { todoId, tagId: Number(tagId) }
}

export async function removeTagFromTodo(todoId, tagId) {
  const [removed] = await db
    .delete(todoTags)
    .where(and(eq(todoTags.todoId, todoId), eq(todoTags.tagId, tagId)))
    .returning()
  if (!removed) throw new HttpError(404, '這個 todo 沒有這個標籤')
}
