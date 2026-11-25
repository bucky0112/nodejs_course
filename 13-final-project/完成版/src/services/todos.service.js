// service：業務邏輯 + 驗證 + 資料存取。不認識 req / res，只吃參數、回資料，出錯就拋 HttpError。
import { prisma } from '../db/prisma.js'
import { HttpError } from '../lib/httpError.js'

// 撈 todo 時一起帶出所屬清單和標籤（標籤要穿過中介表 todoTags）
const withRelations = {
  list: true,
  todoTags: { include: { tag: true }, orderBy: { tagId: 'asc' } },
}

// 把 todoTags: [{ todoId, tagId, tag: {...} }] 攤平成 tags: [{...}]，前端比較好用
function shapeTodo(todo) {
  const { todoTags, ...rest } = todo
  return { ...rest, tags: todoTags.map((link) => link.tag) }
}

async function findOrThrow(id) {
  if (!Number.isInteger(id)) throw new HttpError(404, '找不到這筆 todo')
  const todo = await prisma.todo.findUnique({ where: { id }, include: withRelations })
  if (!todo) throw new HttpError(404, '找不到這筆 todo')
  return todo
}

function assertTitle(title) {
  if (typeof title !== 'string' || title.trim() === '') {
    throw new HttpError(400, 'title 必填，且必須是非空字串')
  }
}

const PRIORITIES = ['low', 'medium', 'high']

function assertPriority(priority) {
  if (!PRIORITIES.includes(priority)) {
    throw new HttpError(400, `priority 必須是 ${PRIORITIES.join('、')} 其中之一`)
  }
}

// listId 可以是 null（不屬於任何清單）；有給數字就要確認清單存在
async function assertListId(listId) {
  if (listId === null) return
  if (!Number.isInteger(listId)) throw new HttpError(400, 'listId 必須是整數或 null')
  const list = await prisma.list.findUnique({ where: { id: listId } })
  if (!list) throw new HttpError(400, '指定的 listId 不存在')
}

export async function listTodos({ completed, priority } = {}) {
  const where = {}
  if (completed !== undefined) where.completed = completed === 'true'
  if (priority !== undefined) {
    assertPriority(priority)
    where.priority = priority
  }
  const todos = await prisma.todo.findMany({ where, include: withRelations, orderBy: { id: 'asc' } })
  return todos.map(shapeTodo)
}

export async function getTodo(id) {
  return shapeTodo(await findOrThrow(id))
}

export async function createTodo({ title, listId, priority } = {}) {
  assertTitle(title)
  if (priority !== undefined) assertPriority(priority)
  if (listId !== undefined) await assertListId(listId)
  const todo = await prisma.todo.create({
    data: { title: title.trim(), listId, priority },
    include: withRelations,
  })
  return shapeTodo(todo)
}

export async function updateTodo(id, { title, completed, listId, priority } = {}) {
  await findOrThrow(id) // 先確認存在（404），再檢查欄位（400）
  if (title !== undefined) assertTitle(title)
  if (completed !== undefined && typeof completed !== 'boolean') {
    throw new HttpError(400, 'completed 必須是布林值')
  }
  if (priority !== undefined) assertPriority(priority)
  if (listId !== undefined) await assertListId(listId)
  if (title === undefined && completed === undefined && listId === undefined && priority === undefined) {
    throw new HttpError(400, '沒有提供要更新的欄位')
  }
  const todo = await prisma.todo.update({
    where: { id },
    data: { title: title?.trim(), completed, listId, priority }, // 值是 undefined 的欄位，Prisma 會略過不更新
    include: withRelations,
  })
  return shapeTodo(todo)
}

export async function deleteTodo(id) {
  await findOrThrow(id)
  await prisma.todo.delete({ where: { id } })
}

// M:N：替 todo 貼上一個標籤（在中介表新增一列）
export async function addTagToTodo(todoId, tagId) {
  await findOrThrow(todoId)
  if (!Number.isInteger(tagId)) throw new HttpError(400, 'tagId 必須是整數')
  const tag = await prisma.tag.findUnique({ where: { id: tagId } })
  if (!tag) throw new HttpError(404, '找不到這個標籤')
  // upsert：已經貼過就不重複新增
  await prisma.todoTag.upsert({
    where: { todoId_tagId: { todoId, tagId } },
    create: { todoId, tagId },
    update: {},
  })
  return getTodo(todoId)
}

// M:N：撕掉一個標籤（刪除中介表的那一列；todo 和 tag 本身都還在）
export async function removeTagFromTodo(todoId, tagId) {
  await findOrThrow(todoId)
  if (!Number.isInteger(tagId)) throw new HttpError(404, '這筆 todo 沒有這個標籤')
  const { count } = await prisma.todoTag.deleteMany({ where: { todoId, tagId } })
  if (count === 0) throw new HttpError(404, '這筆 todo 沒有這個標籤')
}
