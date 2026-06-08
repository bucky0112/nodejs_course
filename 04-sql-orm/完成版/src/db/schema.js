import { pgTable, integer, varchar, boolean, timestamp } from 'drizzle-orm/pg-core'

// todos 表：對應 S1 手寫的那張表
// 注意：id 用 generatedAlwaysAsIdentity()，對應 SQL 的
//       「GENERATED ALWAYS AS IDENTITY」（非舊式 serial）。
export const todos = pgTable('todos', {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  title: varchar({ length: 200 }).notNull(),
  completed: boolean().notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
