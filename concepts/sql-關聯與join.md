# 概念卡：SQL 關聯與 JOIN

> 一句話：關聯式資料庫把資料拆成多張表，再用「**外鍵**」把它們連起來；查詢時用 **JOIN** 把分散的資料拼回一張結果表。

---

## 一、為什麼要拆成多張表

我們的 todo app，如果全部塞一張表會變這樣：

| id | title | list_name | tags |
|---|---|---|---|
| 1 | 寫週報 | 工作 | 緊急,重要 |

問題：清單名稱重複存很多次（改名要改一堆列）、tags 擠在一個欄位裡沒辦法好好查詢。**關聯式資料庫的做法是「拆開、用 id 連起來」**。

---

## 二、一對多（1:N）

「一個清單有多個 todo，但一個 todo 只屬於一個清單。」

做法：在「多」的那邊（todos）放一個**外鍵**指向「一」的那邊（lists）：

```sql
CREATE TABLE lists (
  id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE todos (
  id      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title   VARCHAR(200) NOT NULL,
  list_id INT REFERENCES lists(id) ON DELETE SET NULL  -- ← 外鍵
);
```

`ON DELETE SET NULL`：清單被刪掉時，底下 todo 的 `list_id` 自動設為 NULL（todo 不會跟著消失）。

---

## 三、多對多（M:N）

「一個 todo 可以有多個標籤，一個標籤也可以貼在多個 todo 上。」

兩邊都是「多」，沒辦法在任一邊放外鍵——要靠**中介表（junction table）**：

```sql
CREATE TABLE tags (
  id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE todo_tags (
  todo_id INT NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
  tag_id  INT NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (todo_id, tag_id)   -- ← 複合主鍵：同一組 (todo, tag) 只能出現一次
);
```

`todo_tags` 每一列代表「某個 todo 貼了某個 tag」。複合主鍵 `(todo_id, tag_id)` 防止重複貼同一個標籤。

---

## 四、JOIN：把資料拼回來

### 1:N — todo 連同它的清單名稱

```sql
SELECT t.title, l.name AS list
FROM todos t
JOIN lists l ON l.id = t.list_id;
```

### M:N — todo 連同它的標籤（要 JOIN 兩次，穿過中介表）

```sql
SELECT t.title, tg.name AS tag
FROM todos t
JOIN todo_tags tt ON tt.todo_id = t.id
JOIN tags tg     ON tg.id = tt.tag_id;
```

### JOIN 的三種常見類型

| 類型 | 回傳 |
|---|---|
| `INNER JOIN`（就是 `JOIN`） | 只回「兩邊都對得上」的列 |
| `LEFT JOIN` | 左表全部都留，右表沒對到的補 NULL |
| `RIGHT JOIN` | 右表全部都留（少用，通常把左右對調改用 LEFT） |

**什麼時候用 LEFT JOIN？** 想算「每個清單有幾筆 todo（包含 0 筆的空清單）」時：

```sql
SELECT l.name, COUNT(t.id) AS todo_count
FROM lists l
LEFT JOIN todos t ON t.list_id = l.id   -- ← 用 JOIN 會漏掉沒有 todo 的清單
GROUP BY l.name;
```

> 用 `INNER JOIN` 的話，沒有任何 todo 的清單會整列消失；`LEFT JOIN` 才會保留它、`COUNT` 出 0。

---

## 延伸
- 這些關聯，到 [M3] 會用 Drizzle ORM 再做一次——你會發現 Drizzle 產生的 SQL 就是這張卡教的東西。
- `COUNT(t.id)` 不會把 NULL 算進去，所以空清單會正確得到 0（而不是 1）。
