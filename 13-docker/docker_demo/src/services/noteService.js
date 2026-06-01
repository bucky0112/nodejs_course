import db from '../config/database.js'
import { notesTable } from '../db/schema.js'
import { eq, desc } from 'drizzle-orm'

export const noteService = {
  // 取得所有筆記
  async findAll() {
    return await db
      .select()
      .from(notesTable)
      .orderBy(desc(notesTable.createdAt))
  },

  // 取得所有筆記及作者（Query API）
  async findAllWithAuthor() {
    return await db.query.notesTable.findMany({
      with: {
        author: true
      },
      orderBy: (notes, { desc }) => [desc(notes.createdAt)]
    })
  },

  // 根據 ID 取得筆記
  async findById(id) {
    const notes = await db
      .select()
      .from(notesTable)
      .where(eq(notesTable.id, id))
    return notes[0] || null
  },

  // 取得筆記及作者（Query API）
  async findByIdWithAuthor(id) {
    return await db.query.notesTable.findFirst({
      where: eq(notesTable.id, id),
      with: {
        author: true
      }
    })
  },

  // 建立筆記
  async create(data) {
    const result = await db
      .insert(notesTable)
      .values(data)
      .returning()
    return result[0]
  },

  // 更新筆記
  async update(id, data) {
    const result = await db
      .update(notesTable)
      .set({
        ...data,
        updatedAt: new Date()  // 自動更新時間
      })
      .where(eq(notesTable.id, id))
      .returning()
    return result[0] || null
  },

  // 刪除筆記
  async delete(id) {
    const result = await db
      .delete(notesTable)
      .where(eq(notesTable.id, id))
      .returning()
    return result[0] || null
  }
}
