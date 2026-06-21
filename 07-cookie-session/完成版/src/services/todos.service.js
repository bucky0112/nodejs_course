import { eq, and, asc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { todos, lists, tags, todoTags } from '../db/schema.js'
import { HttpError } from '../lib/httpError.js'

// 把 Query API 撈出來的 todo 整理成乾淨格式：todoTags:[{tag}] → tags:[tag]
// 同時去掉 userId（屬於內部欄位，不對外曝光）。
function shapeTodo(todo) {
  const { todoTags: links, userId, ...rest } = todo
  return { ...rest, tags: (links ?? []).map((l) => l.tag) }
}

// 載入「屬於目前登入者」的 todo；不是自己的就回 undefined（不洩漏存在與否）
async function loadOwnedTodo(id, userId) {
  return db.query.todos.findFirst({
    where: and(eq(todos.id, id), eq(todos.userId, userId)),
    with: { list: true, todoTags: { with: { tag: true } } },
  })
}

export async function listTodos(userId) {
  const rows = await db.query.todos.findMany({
    where: eq(todos.userId, userId),
    with: { list: true, todoTags: { with: { tag: true } } },
    orderBy: asc(todos.id),
  })
  return rows.map(shapeTodo)
}

export async function getTodo(id, userId) {
  const todo = await loadOwnedTodo(id, userId)
  if (!todo) throw new HttpError(404, '找不到這筆 todo')
  return shapeTodo(todo)
}

export async function createTodo({ title, listId }, userId) {
  if (typeof title !== 'string' || title.trim() === '') {
    throw new HttpError(400, 'title 必填，且必須是非空字串')
  }
  if (listId !== undefined && listId !== null) {
    const list = await db.query.lists.findFirst({ where: eq(lists.id, Number(listId)) })
    if (!list) throw new HttpError(400, '指定的 listId 不存在')
  }
  const [todo] = await db
    .insert(todos)
    .values({ title: title.trim(), listId: listId ?? null, userId })
    .returning()
  return todo
}

export async function updateTodo(id, { title, completed, listId }, userId) {
  const owned = await loadOwnedTodo(id, userId)
  if (!owned) throw new HttpError(404, '找不到這筆 todo')

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
  const [todo] = await db.update(todos).set(fields).where(eq(todos.id, owned.id)).returning()
  return todo
}

export async function deleteTodo(id, userId) {
  const owned = await loadOwnedTodo(id, userId)
  if (!owned) throw new HttpError(404, '找不到這筆 todo')
  await db.delete(todos).where(eq(todos.id, owned.id))
}

export async function addTagToTodo(todoId, tagId, userId) {
  const owned = await loadOwnedTodo(todoId, userId)
  if (!owned) throw new HttpError(404, '找不到這筆 todo')
  const tag = await db.query.tags.findFirst({ where: eq(tags.id, tagId) })
  if (!tag) throw new HttpError(404, '找不到這個標籤')
  await db.insert(todoTags).values({ todoId: owned.id, tagId }).onConflictDoNothing()
  return { todoId: owned.id, tagId }
}

export async function removeTagFromTodo(todoId, tagId, userId) {
  const owned = await loadOwnedTodo(todoId, userId)
  if (!owned) throw new HttpError(404, '找不到這筆 todo')
  const [removed] = await db
    .delete(todoTags)
    .where(and(eq(todoTags.todoId, owned.id), eq(todoTags.tagId, tagId)))
    .returning()
  if (!removed) throw new HttpError(404, '這個 todo 沒有這個標籤')
}
