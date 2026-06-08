import { pgTable, integer, varchar, boolean, timestamp } from 'drizzle-orm/pg-core'

// 沿用主線 todo app 的 todos 表（與 M2 相同）
export const todos = pgTable('todos', {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  title: varchar({ length: 200 }).notNull(),
  completed: boolean().notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
