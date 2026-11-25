import { prisma } from '../db/prisma.js'
import { HttpError } from '../lib/httpError.js'

async function findOrThrow(id, include) {
  if (!Number.isInteger(id)) throw new HttpError(404, '找不到這個清單')
  const list = await prisma.list.findUnique({ where: { id }, include })
  if (!list) throw new HttpError(404, '找不到這個清單')
  return list
}

export async function listLists() {
  return prisma.list.findMany({ orderBy: { id: 'asc' } })
}

// 1:N：一次撈出清單和底下所有 todo
export async function getList(id) {
  return findOrThrow(id, { todos: { orderBy: { id: 'asc' } } })
}

export async function createList({ name } = {}) {
  if (typeof name !== 'string' || name.trim() === '') {
    throw new HttpError(400, 'name 必填，且必須是非空字串')
  }
  return prisma.list.create({ data: { name: name.trim() } })
}

// 刪除清單時，底下的 todo 不會被刪，list_id 會變成 NULL（schema 設定 onDelete: SetNull）
export async function deleteList(id) {
  await findOrThrow(id)
  await prisma.list.delete({ where: { id } })
}
