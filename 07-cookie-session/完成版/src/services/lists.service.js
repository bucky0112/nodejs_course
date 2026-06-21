import { asc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { lists } from '../db/schema.js'
import { HttpError } from '../lib/httpError.js'

// 此版 lists 為共用、不綁 user（僅要求登入），故不加 ownership。

export async function listLists() {
  return db.select().from(lists).orderBy(asc(lists.id))
}

export async function createList({ name }) {
  if (typeof name !== 'string' || name.trim() === '') {
    throw new HttpError(400, 'name 必填')
  }
  const [list] = await db.insert(lists).values({ name: name.trim() }).returning()
  return list
}
