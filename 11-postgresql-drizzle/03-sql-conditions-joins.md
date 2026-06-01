# 條件查詢與關聯

這一章涵蓋了 SQL 查詢中最重要的進階概念：
- 條件運算子
- 分頁查詢
- 關聯查詢 (JOIN)
- 聚合函數

這些概念對應到 Drizzle ORM 後，會讓你更容易理解 ORM 的運作方式。

---

## 條件運算子

### 比較運算子

| 運算子 | 說明 | 範例 |
|--------|------|------|
| `=` | 等於 | `WHERE id = 1` |
| `!=` 或 `<>` | 不等於 | `WHERE status != 'deleted'` |
| `>` | 大於 | `WHERE age > 18` |
| `<` | 小於 | `WHERE price < 100` |
| `>=` | 大於等於 | `WHERE age >= 18` |
| `<=` | 小於等於 | `WHERE price <= 100` |

### 邏輯運算子

```sql
-- AND：同時滿足兩個條件
SELECT * FROM users
WHERE age >= 18 AND is_active = true;

-- OR：滿足其中一個條件
SELECT * FROM users
WHERE name = '小明' OR name = '小華';

-- NOT：否定條件
SELECT * FROM users
WHERE NOT is_active;
```

### 特殊運算子

#### IN：在清單中

```sql
-- 查詢 id 是 1, 2, 3 的使用者
SELECT * FROM users
WHERE id IN (1, 2, 3);

-- 等同於
SELECT * FROM users
WHERE id = 1 OR id = 2 OR id = 3;
```

#### LIKE：模糊比對

```sql
-- 標題包含「學習」的筆記
SELECT * FROM notes
WHERE title LIKE '%學習%';

-- 標題以「我的」開頭
SELECT * FROM notes
WHERE title LIKE '我的%';

-- 標題以「筆記」結尾
SELECT * FROM notes
WHERE title LIKE '%筆記';
```

| 萬用字元 | 說明 |
|----------|------|
| `%` | 任意數量的任意字元 |
| `_` | 單一任意字元 |

#### BETWEEN：範圍內

```sql
-- 查詢 id 在 1~5 之間的使用者
SELECT * FROM users
WHERE id BETWEEN 1 AND 5;

-- 查詢特定日期範圍的筆記
SELECT * FROM notes
WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31';
```

#### IS NULL / IS NOT NULL：空值判斷

```sql
-- 查詢沒有內容的筆記
SELECT * FROM notes
WHERE content IS NULL;

-- 查詢有內容的筆記
SELECT * FROM notes
WHERE content IS NOT NULL;
```

---

## 分頁查詢

### ORDER BY：排序

```sql
-- 升冪排序 (ASC，預設)
SELECT * FROM users ORDER BY name ASC;

-- 降冪排序 (DESC)
SELECT * FROM users ORDER BY created_at DESC;

-- 多欄位排序：先依 is_active 降冪，再依 name 升冪
SELECT * FROM users ORDER BY is_active DESC, name ASC;
```

### LIMIT 和 OFFSET：分頁

```sql
-- 取前 10 筆
SELECT * FROM notes LIMIT 10;

-- 跳過前 10 筆，取接下來的 10 筆 (第 2 頁)
SELECT * FROM notes LIMIT 10 OFFSET 10;

-- 跳過前 20 筆，取接下來的 10 筆 (第 3 頁)
SELECT * FROM notes LIMIT 10 OFFSET 20;
```

### 分頁公式

```
第 N 頁的資料 = OFFSET (N - 1) * 每頁筆數 LIMIT 每頁筆數
```

| 頁數 | 每頁筆數 | OFFSET | LIMIT |
|------|----------|--------|-------|
| 1 | 10 | 0 | 10 |
| 2 | 10 | 10 | 10 |
| 3 | 10 | 20 | 10 |

### 常見的分頁查詢

```sql
-- API 分頁查詢範例
-- 第 2 頁，每頁 20 筆，依建立時間降冪排序
SELECT * FROM notes
ORDER BY created_at DESC
LIMIT 20 OFFSET 20;
```

---

## 關聯查詢 (JOIN)

### 為什麼需要 JOIN？

資料分散在不同的表格中，我們需要把它們「合併」起來。

例如：查詢「所有筆記及其作者名稱」

- `notes` 表有 `user_id`
- `users` 表有 `name`
- 我們需要把它們連結起來

### Foreign Key (外鍵) 回顧

```sql
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    user_id INTEGER REFERENCES users(id)  -- 外鍵
);
```

`user_id` 就是外鍵，它參照 `users` 表的 `id` 欄位。

### INNER JOIN (內連結)

只回傳兩邊都有匹配的資料。

```sql
SELECT * FROM notes
INNER JOIN users ON notes.user_id = users.id;
```

但是這樣會回傳所有欄位，通常我們只需要特定欄位：

```sql
SELECT notes.id, notes.title, users.name AS author
FROM notes
INNER JOIN users ON notes.user_id = users.id;
```

```sql
SELECT
    notes.id,            -- 只要筆記的 ID
    notes.title,         -- 只要標題
    users.username AS author  -- 把 username 改名貼標籤叫 author
FROM ...
```

**結果**：只會顯示有作者的筆記（如果 user_id 是 NULL 或找不到對應的 user，就不會顯示）

```
┌────┬──────────────┬────────┐
│ id │ title        │ author │
├────┼──────────────┼────────┤
│ 1  │ 我的第一則筆記 │ 小明   │
│ 2  │ 學習 SQL      │ 小華   │
│ 3  │ 學習 Node.js  │ 小華   │
└────┴──────────────┴────────┘
```

如果要排序的話，會是：

```sql
SELECT
	notes.id,
	notes.title,
	users.username AS author FROM notes 
INNER JOIN users ON notes.user_id = users.id
ORDER BY notes.id ASC;
```

在 SQL 的語法順序裡，邏輯是這樣的：

FROM / JOIN：先把資料找出來、接起來。

WHERE：過濾掉不要的（如果有的話）。

ORDER BY：最後才把留下來的結果拿來排順序。

### LEFT JOIN (左連結)

左邊表格的資料全部保留，右邊沒匹配的補 NULL。

```sql
SELECT
  users.id,
  users.name,
  notes.title FROM users
LEFT JOIN notes ON users.id = notes.user_id;
```

**結果**：即使使用者沒有筆記，也會顯示出來

```
┌────┬──────┬──────────────┐
│ id │ name │ title        │
├────┼──────┼──────────────┤
│ 1  │ 小明 │ 我的第一則筆記 │
│ 2  │ 小華 │ 學習 SQL      │
│ 2  │ 小華 │ 學習 Node.js  │
│ 3  │ 小美 │ NULL         │  ← 小美沒有筆記
│ 4  │ 小強 │ NULL         │  ← 小強沒有筆記
└────┴──────┴──────────────┘
```

### INNER JOIN vs LEFT JOIN 圖解

```
    users              notes
  ┌───────┐          ┌───────┐
  │       │          │       │
  │   A   │          │   B   │
  │       ├──────────┤       │
  │   ████│██████████│████   │  ← INNER JOIN: 只有交集 (████)
  │       ├──────────┤       │
  │       │          │       │
  └───────┘          └───────┘

    users              notes
  ┌───────┐          ┌───────┐
  │███████│          │       │
  │███████│          │       │
  │███████├──────────┤███████│  ← LEFT JOIN: 左邊全部 + 交集
  │███████│██████████│███████│
  │███████├──────────┤       │
  │███████│          │       │
  └───────┘          └───────┘
```

### 使用場景

| JOIN 類型 | 使用場景 |
|-----------|----------|
| INNER JOIN | 只需要有關聯的資料（例如：列出所有有訂單的客戶） |
| LEFT JOIN | 需要左表全部資料，即使沒有關聯（例如：列出所有使用者，包含沒發過文的） |

### 表格別名

```sql
-- 使用別名讓 SQL 更簡潔
SELECT n.id, n.title, u.name AS author
FROM notes AS n
INNER JOIN users AS u ON n.user_id = u.id;

-- AS 可以省略
SELECT n.id, n.title, u.name AS author
FROM notes n
INNER JOIN users u ON n.user_id = u.id;
```

---

## 聚合函數

聚合函數用來對一組資料進行計算，回傳單一結果。

### 常用聚合函數

| 函數 | 說明 | 範例 |
|------|------|------|
| `COUNT()` | 計算筆數 | `COUNT(*)` |
| `SUM()` | 加總 | `SUM(price)` |
| `AVG()` | 平均值 | `AVG(score)` |
| `MAX()` | 最大值 | `MAX(created_at)` |
| `MIN()` | 最小值 | `MIN(price)` |

### COUNT：計算筆數

```sql
-- 總共有多少使用者
SELECT COUNT(*) FROM users;

-- 有多少則筆記
SELECT COUNT(*) FROM notes;

-- 有多少則筆記有 user_id (不計算 NULL)
SELECT COUNT(user_id) FROM notes;
```

### GROUP BY：分組

GROUP BY 是新手的罩門，但理解後非常強大。

**概念**：把資料依某個欄位分組，然後對每組進行聚合計算。

```sql
-- 計算每個使用者有多少則筆記
SELECT user_id, COUNT(*) AS note_count
FROM notes
GROUP BY user_id;
```

**結果**：

```
┌─────────┬────────────┐
│ user_id │ note_count │
├─────────┼────────────┤
│ 1       │ 1          │
│ 2       │ 2          │
└─────────┴────────────┘
```

### GROUP BY + JOIN

```sql
-- 計算每個使用者有多少則筆記 (顯示使用者名稱)
SELECT u.name, COUNT(n.id) AS note_count
FROM users u
LEFT JOIN notes n ON u.id = n.user_id
GROUP BY u.id, u.name;
```

**結果**：

```
┌──────┬────────────┐
│ name │ note_count │
├──────┼────────────┤
│ 小明 │ 1          │
│ 小華 │ 2          │
│ 小美 │ 0          │  ← LEFT JOIN 讓沒有筆記的使用者也出現
│ 小強 │ 0          │
└──────┴────────────┘
```

### HAVING：過濾分組結果

- `WHERE`：過濾原始資料（分組前）
- `HAVING`：過濾分組後的結果

```sql
-- 找出發文超過 1 則的使用者
SELECT u.name, COUNT(n.id) AS note_count
FROM users u
LEFT JOIN notes n ON u.id = n.user_id
GROUP BY u.id, u.name
HAVING COUNT(n.id) > 1;
```

**結果**：

```
┌──────┬────────────┐
│ name │ note_count │
├──────┼────────────┤
│ 小華 │ 2          │
└──────┴────────────┘
```

### WHERE vs HAVING

```sql
-- WHERE：過濾原始資料
SELECT user_id, COUNT(*) AS note_count
FROM notes
WHERE title LIKE '%學習%'  -- 先過濾標題包含「學習」的筆記
GROUP BY user_id;

-- HAVING：過濾分組結果
SELECT user_id, COUNT(*) AS note_count
FROM notes
GROUP BY user_id
HAVING COUNT(*) >= 2;  -- 過濾掉筆記數少於 2 的群組
```

---

## 綜合練習

### 練習 1：條件查詢

```sql
-- 1. 查詢所有名字包含「小」的使用者
-- 2. 查詢 id 在 1~3 之間的使用者
-- 3. 查詢 2024 年建立的筆記
```

### 練習 2：分頁查詢

```sql
-- 1. 查詢所有筆記，依建立時間降冪排序，取前 5 筆
-- 2. 實作第 2 頁（每頁 5 筆）的查詢
```

### 練習 3：JOIN 查詢

```sql
-- 1. 查詢所有筆記及其作者名稱
-- 2. 查詢所有使用者及其筆記數量（包含沒有筆記的使用者）
```

### 練習 4：聚合查詢

```sql
-- 1. 計算總共有多少則筆記
-- 2. 計算每個使用者的筆記數量
-- 3. 找出發文最多的使用者
```

---

## 參考答案

<details>
<summary>點擊查看答案</summary>

### 練習 1 答案

```sql
-- 1
SELECT * FROM users WHERE name LIKE '%小%';

-- 2
SELECT * FROM users WHERE id BETWEEN 1 AND 3;

-- 3
SELECT * FROM notes
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';
```

### 練習 2 答案

```sql
-- 1
SELECT * FROM notes ORDER BY created_at DESC LIMIT 5;

-- 2
SELECT * FROM notes ORDER BY created_at DESC LIMIT 5 OFFSET 5;
```

### 練習 3 答案

```sql
-- 1
SELECT n.id, n.title, u.name AS author
FROM notes n
INNER JOIN users u ON n.user_id = u.id;

-- 2
SELECT u.name, COUNT(n.id) AS note_count
FROM users u
LEFT JOIN notes n ON u.id = n.user_id
GROUP BY u.id, u.name;
```

### 練習 4 答案

```sql
-- 1
SELECT COUNT(*) FROM notes;

-- 2
SELECT u.name, COUNT(n.id) AS note_count
FROM users u
LEFT JOIN notes n ON u.id = n.user_id
GROUP BY u.id, u.name;

-- 3
SELECT u.name, COUNT(n.id) AS note_count
FROM users u
LEFT JOIN notes n ON u.id = n.user_id
GROUP BY u.id, u.name
ORDER BY note_count DESC
LIMIT 1;
```

</details>

---

## 重點回顧

| 概念 | 重點 |
|------|------|
| AND / OR | 組合多個條件 |
| IN | 在清單中 |
| LIKE | 模糊比對，用 `%` 當萬用字元 |
| ORDER BY | 排序，ASC 升冪 / DESC 降冪 |
| LIMIT / OFFSET | 分頁查詢 |
| INNER JOIN | 只取交集，兩邊都有的資料 |
| LEFT JOIN | 保留左表全部，右表沒匹配的補 NULL |
| COUNT / SUM / AVG | 聚合函數 |
| GROUP BY | 分組後計算 |
| HAVING | 過濾分組結果 |

---

## 下一章

恭喜你完成了 SQL 基礎！

從下一章開始，我們會進入 **Drizzle ORM**，你會發現：
- 這些 SQL 概念在 Drizzle 中都有對應的語法
- 但寫起來更簡單、更安全、更容易維護
- 而且有自動補全和型別提示！

準備好了嗎？讓我們開始吧！
