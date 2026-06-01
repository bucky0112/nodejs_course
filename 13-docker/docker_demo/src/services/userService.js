import db from '../config/database.js'
import { usersTable, notesTable } from '../db/schema.js'
import { eq, desc, count } from 'drizzle-orm'

export const userService = {
  // 取得所有使用者
  async findAll() {
    return await db
      .select()
      .from(usersTable)
      .orderBy(desc(usersTable.createdAt))
  },

  // 根據 ID 取得使用者
  async findById(id) {
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
    return users[0] || null
  },

  // 取得使用者及其筆記（Query API）
  async findByIdWithNotes(id) {
    return await db.query.usersTable.findFirst({
      where: eq(usersTable.id, id),
      with: {
        notes: {
          orderBy: (notes, { desc }) => [desc(notes.createdAt)]
        }
      }
    })
  },

  // 取得所有使用者及筆記數量（leftJoin + 聚合）
  async findAllWithNoteCount() {
    return await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        createdAt: usersTable.createdAt,
        noteCount: count(notesTable.id)
      })
      .from(usersTable)
      .leftJoin(notesTable, eq(usersTable.id, notesTable.userId))
      .groupBy(usersTable.id, usersTable.name, usersTable.email, usersTable.createdAt)
      .orderBy(desc(usersTable.createdAt))
  },

  // 建立使用者
  async create(data) {
    const result = await db
      .insert(usersTable)
      .values(data)
      .returning()
    return result[0]
  },

  // 更新使用者
  async update(id, data) {
    const result = await db
      .update(usersTable)
      .set(data)
      .where(eq(usersTable.id, id))
      .returning()
    return result[0] || null
  },

  // 刪除使用者
  async delete(id) {
    const result = await db
      .delete(usersTable)
      .where(eq(usersTable.id, id))
      .returning()
    return result[0] || null
  }
}
