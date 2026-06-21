import { pgTable, integer, varchar, boolean, timestamp, primaryKey } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ---------- 使用者 ----------
export const users = pgTable('users', {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  username: varchar({ length: 50 }).notNull().unique(),
  // 存的是 bcrypt 雜湊後的字串，不是明文密碼！
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ---------- 清單 ----------
export const lists = pgTable('lists', {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
})

// ---------- 待辦事項（現在屬於某個 user）----------
export const todos = pgTable('todos', {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  title: varchar({ length: 200 }).notNull(),
  completed: boolean().notNull().default(false),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  listId: integer('list_id').references(() => lists.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ---------- 標籤 ----------
export const tags = pgTable('tags', {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  name: varchar({ length: 50 }).notNull().unique(),
})

export const todoTags = pgTable(
  'todo_tags',
  {
    todoId: integer('todo_id').notNull().references(() => todos.id, { onDelete: 'cascade' }),
    tagId: integer('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.todoId, t.tagId] })],
)

// ---------- 關聯 ----------
export const usersRelations = relations(users, ({ many }) => ({
  todos: many(todos),
}))

export const listsRelations = relations(lists, ({ many }) => ({
  todos: many(todos),
}))

export const todosRelations = relations(todos, ({ one, many }) => ({
  user: one(users, { fields: [todos.userId], references: [users.id] }),
  list: one(lists, { fields: [todos.listId], references: [lists.id] }),
  todoTags: many(todoTags),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  todoTags: many(todoTags),
}))

export const todoTagsRelations = relations(todoTags, ({ one }) => ({
  todo: one(todos, { fields: [todoTags.todoId], references: [todos.id] }),
  tag: one(tags, { fields: [todoTags.tagId], references: [tags.id] }),
}))
