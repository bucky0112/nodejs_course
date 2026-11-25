-- 第 9 堂完成版：範例查詢集
-- 可整檔執行，或在 psql 裡一段一段貼來看結果。
-- 注意：整檔執行會改到資料（新增一筆 id 7 再刪掉、把 id 3 標成完成），這是預期的。

-- ========== CRUD ==========

-- C：新增一筆 todo
INSERT INTO todos (title, list_id) VALUES ('整理桌面', 2);

-- R：讀取全部
SELECT * FROM todos;

-- R：條件查詢（未完成的，依建立時間新到舊）
SELECT id, title, completed
FROM todos
WHERE completed = false
ORDER BY created_at DESC
LIMIT 5;

-- U：部分更新（把某筆標記為完成）
UPDATE todos SET completed = true WHERE id = 3;

-- D：刪除（一定要有 WHERE！）
DELETE FROM todos WHERE id = 7;

-- ========== 聚合 ==========

-- 每個清單有幾筆 todo（用 LEFT JOIN 才不會漏掉空清單）
SELECT l.name, COUNT(t.id) AS todo_count
FROM lists l
LEFT JOIN todos t ON t.list_id = l.id
GROUP BY l.name
ORDER BY todo_count DESC;

-- 已完成 / 未完成各幾筆
SELECT completed, COUNT(*) AS n
FROM todos
GROUP BY completed;

-- ========== JOIN ==========

-- 1:N：todo 連同它的清單名稱
SELECT t.title, l.name AS list
FROM todos t
JOIN lists l ON l.id = t.list_id
ORDER BY t.id;

-- M:N：todo 連同它的標籤（穿過中介表 JOIN 兩次）
SELECT t.title, tg.name AS tag
FROM todos t
JOIN todo_tags tt ON tt.todo_id = t.id
JOIN tags tg      ON tg.id = tt.tag_id
ORDER BY t.id;

-- 交易（BEGIN / COMMIT / ROLLBACK）在第 10 堂：10-postgresql-advanced/完成版/transaction.sql
