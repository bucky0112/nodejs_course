import { pgTable, integer, varchar, boolean, timestamp, primaryKey } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ---------- 表格定義 ----------

// 清單：一個清單有多個 todo（1:N 的「一」邊）
export const lists = pgTable('lists', {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
})

// 待辦事項：多了 listId 外鍵（1:N 的「多」邊）
export const todos = pgTable('todos', {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  title: varchar({ length: 200 }).notNull(),
  completed: boolean().notNull().default(false),
  listId: integer('list_id').references(() => lists.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// 標籤
export const tags = pgTable('tags', {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  name: varchar({ length: 50 }).notNull().unique(),
})

// todo 與 tag 的中介表（M:N）
export const todoTags = pgTable(
  'todo_tags',
  {
    todoId: integer('todo_id').notNull().references(() => todos.id, { onDelete: 'cascade' }),
    tagId: integer('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.todoId, t.tagId] })], // 複合主鍵：(todo, tag) 不重複
)

// ---------- 關聯定義（給 Drizzle Query API 用）----------

export const listsRelations = relations(lists, ({ many }) => ({
  todos: many(todos),
}))

export const todosRelations = relations(todos, ({ one, many }) => ({
  list: one(lists, { fields: [todos.listId], references: [lists.id] }),
  todoTags: many(todoTags),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  todoTags: many(todoTags),
}))

// M:N 透過中介表：todoTags 各自連回 todo 與 tag
export const todoTagsRelations = relations(todoTags, ({ one }) => ({
  todo: one(todos, { fields: [todoTags.todoId], references: [todos.id] }),
  tag: one(tags, { fields: [todoTags.tagId], references: [tags.id] }),
}))
