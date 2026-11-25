# 概念卡：Prisma 的關聯查詢

> 一句話：在 `schema.prisma` 用「關聯欄位」描述表跟表怎麼連，之後查詢時加上 `include`，就能一次撈出關聯資料，不必自己手寫 JOIN。

這張卡接續 [SQL 關聯與 JOIN](./sql-關聯與join.md)：那張講資料庫層面的關聯，這張講 Prisma 怎麼操作它。

---

## 一、在 schema 裡描述關聯

### 1:N（一個清單有多筆 todo）

```prisma
model List {
  id    Int    @id @default(autoincrement())
  name  String
  todos Todo[]          // 關聯欄位：「一」邊，型別是陣列
}

model Todo {
  id     Int   @id @default(autoincrement())
  listId Int?  @map("list_id")                                       // 真正的外鍵欄位
  list   List? @relation(fields: [listId], references: [id], onDelete: SetNull) // 關聯欄位
}
```

兩種欄位要分清楚：

| | 例子 | 會變成資料庫的欄位嗎 |
|---|---|---|
| 外鍵欄位 | `listId` | 會，就是 `list_id` |
| 關聯欄位 | `list`、`todos` | 不會，只是讓 Prisma 知道可以從這邊走到那邊 |

`@relation(fields: [listId], references: [id])` 的意思是：「`Todo.listId` 對應到 `List.id`」，等同 SQL 的 `REFERENCES lists(id)`。`onDelete: SetNull` 等同 `ON DELETE SET NULL`。

### M:N（一筆 todo 有多個標籤、一個標籤貼在多筆 todo）

多對多的關係存在**中介表**裡。本課程把中介表明確寫成一個 model，跟[第 9 堂](../09-postgresql-basics/)的 `todo_tags` 一模一樣：

```prisma
model TodoTag {
  todoId Int  @map("todo_id")
  tagId  Int  @map("tag_id")
  todo   Todo @relation(fields: [todoId], references: [id], onDelete: Cascade)
  tag    Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([todoId, tagId])   // 複合主鍵
  @@map("todo_tags")
}
```

> Prisma 也支援「隱式」多對多（兩邊直接寫 `tags Tag[]`、`todos Todo[]`，中介表由 Prisma 自動產生）。寫法比較短，但中介表的名稱和欄位由 Prisma 決定，也不能在中介表上加其他欄位（例如「什麼時候貼上的」）。

---

## 二、查詢時用 `include`

```js
const todo = await prisma.todo.findUnique({
  where: { id: 1 },
  include: {
    list: true,                               // 帶出所屬清單
    todoTags: { include: { tag: true } },     // 穿過中介表帶出標籤
  },
})
```

查出來的形狀：

```js
{
  id: 1,
  title: '寫報告',
  listId: 1,
  list: { id: 1, name: '工作' },
  todoTags: [{ todoId: 1, tagId: 1, tag: { id: 1, name: '急件' } }],
}
```

`todoTags` 多包了一層。實務上常在 service 裡攤平成乾淨的 `tags`，前端比較好用：

```js
function shapeTodo(todo) {
  const { todoTags, ...rest } = todo
  return { ...rest, tags: todoTags.map((link) => link.tag) }
}
```

---

## 三、新增與刪除關聯

| 想做的事 | Prisma | 對應的 SQL |
|---|---|---|
| todo 放進清單 | `prisma.todo.update({ where: { id }, data: { listId: 1 } })` | `UPDATE todos SET list_id = 1 WHERE id = ...` |
| 替 todo 貼標籤 | `prisma.todoTag.create({ data: { todoId, tagId } })` | `INSERT INTO todo_tags ...` |
| 撕掉一個標籤 | `prisma.todoTag.deleteMany({ where: { todoId, tagId } })` | `DELETE FROM todo_tags WHERE todo_id = ... AND tag_id = ...` |

> ⚠️ 撕標籤時 `where` 要**同時**比對 `todoId` 和 `tagId`。只比對 `todoId`，會把這筆 todo 的所有標籤一次撕光。

---

## 延伸
- `include` 會撈出關聯資料的**所有欄位**。只想要部分欄位時，改用 `select`，例如 `select: { id: true, title: true, list: { select: { name: true } } }`。
- 想看 Prisma 實際送出的 SQL，建立 client 時加上 `log: ['query']`。你會看到 `include` 背後是額外的查詢或 JOIN。
