import { pgTable, integer, varchar, boolean, timestamp, primaryKey } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const users = pgTable('users', {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  username: varchar({ length: 50 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  googleId: varchar('google_id', { length: 255 }).unique(),
  // 頭像在 S3 的 object key（不是公開網址；要看圖時用 presigned URL 產生）
  avatarKey: varchar('avatar_key', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const lists = pgTable('lists', {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
})

export const todos = pgTable('todos', {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  title: varchar({ length: 200 }).notNull(),
  completed: boolean().notNull().default(false),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  listId: integer('list_id').references(() => lists.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

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

export const usersRelations = relations(users, ({ many }) => ({ todos: many(todos) }))
export const listsRelations = relations(lists, ({ many }) => ({ todos: many(todos) }))
export const todosRelations = relations(todos, ({ one, many }) => ({
  user: one(users, { fields: [todos.userId], references: [users.id] }),
  list: one(lists, { fields: [todos.listId], references: [lists.id] }),
  todoTags: many(todoTags),
}))
export const tagsRelations = relations(tags, ({ many }) => ({ todoTags: many(todoTags) }))
export const todoTagsRelations = relations(todoTags, ({ one }) => ({
  todo: one(todos, { fields: [todoTags.todoId], references: [todos.id] }),
  tag: one(tags, { fields: [todoTags.tagId], references: [tags.id] }),
}))
