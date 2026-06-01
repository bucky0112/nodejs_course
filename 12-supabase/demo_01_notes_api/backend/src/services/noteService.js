import { eq } from 'drizzle-orm'
import db from '../config/database.js'
import { notes } from '../db/schema.js'

export const noteService = {
  async findAll() {
    return await db.query.notes.findMany({
      with: {
        user: true
      },
      orderBy: (notes, { desc }) => [desc(notes.createdAt)]
    })
  },

  async findById(id) {
    return await db.query.notes.findFirst({
      where: eq(notes.id, id),
      with: {
        user: true
      }
    })
  },

  async findByUserId(userId) {
    return await db.query.notes.findMany({
      where: eq(notes.userId, userId),
      with: {
        user: true
      },
      orderBy: (notes, { desc }) => [desc(notes.createdAt)]
    })
  },

  async create(data) {
    const result = await db.insert(notes).values(data).returning()
    return result[0]
  },

  async update(id, data) {
    const result = await db
      .update(notes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(notes.id, id))
      .returning()
    return result[0]
  },

  async delete(id) {
    const result = await db
      .delete(notes)
      .where(eq(notes.id, id))
      .returning()
    return result[0]
  }
}
