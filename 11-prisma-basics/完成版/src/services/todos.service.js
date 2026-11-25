// service：業務邏輯 + 驗證 + 資料存取。不認識 req / res，只吃參數、回資料，出錯就拋 HttpError。
// 第 6 堂的記憶體陣列，換成 Prisma 查詢 PostgreSQL。controller 和 routes 一行都沒改。
import { prisma } from '../db/prisma.js'
import { HttpError } from '../lib/httpError.js'

async function findOrThrow(id) {
  // /todos/abc 轉成數字是 NaN，不是合法 id，直接當作找不到
  if (!Number.isInteger(id)) throw new HttpError(404, '找不到這筆 todo')
  const todo = await prisma.todo.findUnique({ where: { id } })
  if (!todo) throw new HttpError(404, '找不到這筆 todo')
  return todo
}

function assertTitle(title) {
  if (typeof title !== 'string' || title.trim() === '') {
    throw new HttpError(400, 'title 必填，且必須是非空字串')
  }
}

export async function listTodos({ completed } = {}) {
  const where = completed === undefined ? {} : { completed: completed === 'true' }
  return prisma.todo.findMany({ where, orderBy: { id: 'asc' } })
}

export async function getTodo(id) {
  return findOrThrow(id)
}

export async function createTodo({ title } = {}) {
  assertTitle(title)
  return prisma.todo.create({ data: { title: title.trim() } })
}

export async function updateTodo(id, { title, completed } = {}) {
  await findOrThrow(id) // 先確認存在（404），再檢查欄位（400）
  if (title !== undefined) assertTitle(title)
  if (completed !== undefined && typeof completed !== 'boolean') {
    throw new HttpError(400, 'completed 必須是布林值')
  }
  if (title === undefined && completed === undefined) {
    throw new HttpError(400, '沒有提供要更新的欄位')
  }
  return prisma.todo.update({
    where: { id },
    data: { title: title?.trim(), completed }, // 值是 undefined 的欄位，Prisma 會略過不更新
  })
}

export async function deleteTodo(id) {
  await findOrThrow(id)
  await prisma.todo.delete({ where: { id } })
}
