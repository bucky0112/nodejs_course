-- 第 10 堂完成版：index（索引）與 EXPLAIN
-- 執行方式：psql -d todo_sql -f index.sql
-- 前提：已在 todo_sql 跑過第 9 堂的 schema.sql、seed.sql。
-- 這個檔最後會把灌進去的資料和建的 index 清掉，讓資料庫回到第 9 堂的樣子；重複執行也不會出錯。
--
-- 注意：EXPLAIN ANALYZE 會「真的執行」查詢，印出的時間每台電腦都不同，看「計畫的長相」就好。

-- ========== 0. 準備：灌 10 萬筆 todo ==========

-- 先清掉上次執行可能留下的東西（第一次執行時這幾行什麼都不會做）
DROP INDEX IF EXISTS todos_title_idx;
DROP INDEX IF EXISTS todos_created_at_idx;
DROP INDEX IF EXISTS todos_completed_idx;
DELETE FROM todos WHERE title LIKE '大量任務 #%';

-- generate_series(1, 100000) 會產生 1 到 100000 的整數，每個數字變成一筆 todo
INSERT INTO todos (title, completed, list_id, created_at)
SELECT
  '大量任務 #' || n,                         -- 標題：大量任務 #1、大量任務 #2 ...
  n % 4 = 0,                                 -- 每 4 筆有 1 筆已完成
  (n % 3) + 1,                               -- 平均分到 3 個清單
  now() - n * interval '1 minute'            -- 建立時間往回推，每筆差 1 分鐘
FROM generate_series(1, 100000) AS n;

-- 更新統計資訊，讓查詢規劃器知道表變大了
ANALYZE todos;

SELECT COUNT(*) AS total_todos FROM todos;

-- ========== 1. 用標題找一筆 todo ==========

-- 沒有 index：只能從頭到尾一列一列看 → Seq Scan
EXPLAIN ANALYZE
SELECT * FROM todos WHERE title = '大量任務 #77777';

CREATE INDEX todos_title_idx ON todos (title);

-- 有 index：直接查索引找到那一列 → Index Scan using todos_title_idx
EXPLAIN ANALYZE
SELECT * FROM todos WHERE title = '大量任務 #77777';

-- ========== 2. 列表頁：最新的 10 筆 ==========

-- 沒有 index：整張表讀完、全部排序，才取前 10 筆 → Seq Scan + Sort
EXPLAIN ANALYZE
SELECT id, title, created_at FROM todos ORDER BY created_at DESC LIMIT 10;

CREATE INDEX todos_created_at_idx ON todos (created_at);

-- 有 index：索引本來就排好序，從尾巴往回讀 10 筆就停 → Index Scan Backward
EXPLAIN ANALYZE
SELECT id, title, created_at FROM todos ORDER BY created_at DESC LIMIT 10;

-- ========== 3. index 不是萬靈丹 ==========

-- 「未完成」的 todo 佔了大約 3/4，就算有 index，讀索引再跳回表裡拿資料
-- 反而比直接整張表掃過去還慢，所以規劃器仍然選 Seq Scan。
CREATE INDEX todos_completed_idx ON todos (completed);

EXPLAIN
SELECT * FROM todos WHERE completed = false;

DROP INDEX todos_completed_idx;

-- ========== 4. 收尾：回到第 9 堂的樣子 ==========

DELETE FROM todos WHERE title LIKE '大量任務 #%';
DROP INDEX todos_title_idx;
DROP INDEX todos_created_at_idx;
ANALYZE todos;

SELECT COUNT(*) AS total_todos_after_cleanup FROM todos;
