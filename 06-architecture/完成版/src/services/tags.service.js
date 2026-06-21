import { asc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { tags } from '../db/schema.js'
import { HttpError } from '../lib/httpError.js'

export async function listTags() {
  return db.select().from(tags).orderBy(asc(tags.id))
}

export async function createTag({ name }) {
  if (typeof name !== 'string' || name.trim() === '') {
    throw new HttpError(400, 'name 必填')
  }
  const [tag] = await db.insert(tags).values({ name: name.trim() }).returning()
  return tag
}
