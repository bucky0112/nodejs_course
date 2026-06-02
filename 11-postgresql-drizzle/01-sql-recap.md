# SQL 回顧與本章導覽

## SQL 基礎在哪裡？

這一章聚焦在 **PostgreSQL + Drizzle ORM**。至於 SQL 本身的語法基礎，
我們已經在 **第 3 章「SQL 教學」** 完整介紹過了，包含：

| 主題 | 章節位置 |
|------|----------|
| 建立資料庫與表格、欄位型別、Constraint | `03-sql-tutorial/01-basic` |
| CRUD（INSERT / SELECT / UPDATE / DELETE） | `03-sql-tutorial/01-basic`、`02-examples` |
| 條件查詢、分頁、JOIN、聚合、集合運算 | `03-sql-tutorial/03-advance` |

> 如果你對 SQL 還不熟，建議先回到第 3 章把基礎打穩，再回來學 Drizzle。

## 快速回顧：你需要記得的 SQL 概念

接下來學 Drizzle 時，這些 SQL 概念都會有對應的寫法：

```sql
-- CRUD
INSERT INTO notes (title, user_id) VALUES ('我的筆記', 1);
SELECT * FROM notes WHERE user_id = 1;
UPDATE notes SET title = '改標題' WHERE id = 1;
DELETE FROM notes WHERE id = 1;

-- 條件、排序、分頁
SELECT * FROM notes
WHERE title LIKE '%學習%'
ORDER BY created_at DESC
LIMIT 10 OFFSET 0;

-- 關聯查詢
SELECT n.title, u.name AS author
FROM notes n
INNER JOIN users u ON n.user_id = u.id;
```

## 為什麼還要學 ORM？

手動寫 SQL 雖然直接，但在實際專案中有不少痛點（字串拼接、SQL Injection
風險、沒有自動補全與型別提示、結構變更難以追蹤……）。下一節我們就會看到
**Drizzle ORM** 如何解決這些問題。

讓我們開始吧！
