# 概念卡：Drizzle 的關聯查詢（Query API）

> 一句話：先用 `relations()` 告訴 Drizzle「表跟表怎麼連」，之後就能用 `db.query.xxx.findMany({ with: {...} })` 一次撈出關聯資料，不必自己手寫 JOIN。

這張卡接續 [SQL 關聯與 JOIN](./sql-關聯與join.md)——那張講資料庫層面的關聯，這張講 Drizzle 怎麼操作它。

---

## 一、兩步驟

### 第 1 步：定義關聯

在 schema 裡，除了 `pgTable`，再用 `relations()` 描述關係：

```js
// 1:N —— 一個 list 有多個 todo
export const listsRelations = relations(lists, ({ many }) => ({
  todos: many(todos),
}))

export const todosRelations = relations(todos, ({ one, many }) => ({
  list: one(lists, { fields: [todos.listId], references: [lists.id] }), // 多對一
  todoTags: many(todoTags),                                            // 通往 M:N
}))
```

- `one(...)`：這一邊只連到「一個」（todo 屬於一個 list）。要指定 `fields`（本表外鍵）和 `references`（對方主鍵）。
- `many(...)`：這一邊連到「多個」（list 有多個 todo）。

### 第 2 步：查詢時用 `with`

```js
const rows = await db.query.todos.findMany({
  with: {
    list: true,                          // 帶出所屬清單
    todoTags: { with: { tag: true } },   // 帶出標籤（穿過中介表）
  },
})
```

Drizzle 會自動產生對應的 JOIN，把巢狀結構組好回傳。

---

## 二、M:N 為什麼要「穿過中介表」

多對多沒辦法直接 `todo.tags`，因為關係存在中介表 `todo_tags` 裡。所以要連兩段：`todo → todoTags → tag`。

定義中介表兩邊的關聯：

```js
export const todoTagsRelations = relations(todoTags, ({ one }) => ({
  todo: one(todos, { fields: [todoTags.todoId], references: [todos.id] }),
  tag:  one(tags,  { fields: [todoTags.tagId],  references: [tags.id] }),
}))
```

查出來會是 `todo.todoTags = [{ tag: {...} }, ...]`。實務上常在路由裡攤平成乾淨的 `tags: [...]`：

```js
function shapeTodo(todo) {
  const { todoTags: links, ...rest } = todo
  return { ...rest, tags: (links ?? []).map((l) => l.tag) }
}
```

> 這種「穿過中介表」是 Drizzle 經典 Relations API 的做法，也最貼近底層 SQL。（新版 Drizzle 有更簡潔的 many-through 寫法，但概念一樣。）

---

## 三、Query API vs 手寫 select

| | `db.query.todos.findMany({ with })` | `db.select().from(todos).leftJoin(...)` |
|---|---|---|
| 適合 | 撈巢狀關聯資料 | 自訂欄位、聚合、複雜條件 |
| 回傳 | 自動組好的巢狀物件 | 扁平的列，要自己組 |

兩個都會用到。撈「一筆 todo 連同它的清單和標籤」用 Query API 最省事；要算「每個清單幾筆 todo」這種聚合，用 `select` + `leftJoin` + `groupBy`。

---

## 延伸
- 要用 Query API，建立 db client 時必須把 schema 傳進去：`drizzle(pool, { schema })`，否則 `db.query` 會是 undefined。
- 刪除 M:N 關聯（撕掉一個標籤）時，記得用 `and(eq(todoId), eq(tagId))` 兩個欄位都比對，否則會誤刪整個 todo 的所有標籤。
