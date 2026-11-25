import { prisma } from '../db/prisma.js'
import { HttpError } from '../lib/httpError.js'

export async function listTags() {
  return prisma.tag.findMany({ orderBy: { id: 'asc' } })
}

export async function createTag({ name } = {}) {
  if (typeof name !== 'string' || name.trim() === '') {
    throw new HttpError(400, 'name 必填，且必須是非空字串')
  }
  // tags.name 有 UNIQUE 限制：先檢查，重複就回 409，而不是讓資料庫報錯變成 500
  const existing = await prisma.tag.findUnique({ where: { name: name.trim() } })
  if (existing) throw new HttpError(409, '這個標籤已經存在')
  return prisma.tag.create({ data: { name: name.trim() } })
}
