import { pgTable, serial, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ============================================
// 表格定義
// ============================================

/**
 * 使用者表
 */
export const usersTable = pgTable("users", {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow()
})

/**
 * 筆記表
 */
export const notesTable = pgTable("notes", {
  id: serial().primaryKey(),
  title: varchar({ length: 255 }).notNull(),
  content: text(),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
})

// ============================================
// 關聯定義
// ============================================

/**
 * User 關聯：一個使用者有多則筆記 (One-to-Many)
 */
export const usersRelations = relations(usersTable, ({ many }) => ({
  notes: many(notesTable)
}))

/**
 * Note 關聯：一則筆記屬於一個使用者 (Many-to-One)
 */
export const notesRelations = relations(notesTable, ({ one }) => ({
  author: one(usersTable, {
    fields: [notesTable.userId],
    references: [usersTable.id]
  })
}))
