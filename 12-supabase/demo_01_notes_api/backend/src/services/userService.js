import { eq } from 'drizzle-orm'
import db from '../config/database.js'
import { users } from '../db/schema.js'

export const userService = {
  async findAll() {
    return await db.query.users.findMany({
      with: {
        notes: true
      }
    })
  },

  async findById(id) {
    return await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        notes: true
      }
    })
  },

  async create(data) {
    const result = await db.insert(users).values(data).returning()
    return result[0]
  },

  async update(id, data) {
    const result = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning()
    return result[0]
  },

  async delete(id) {
    const result = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning()
    return result[0]
  }
}
