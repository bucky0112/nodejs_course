-- 第 10 堂完成版：正規化——把重複的欄位拆成兩張表
-- 執行方式：psql -d todo_sql -f normalization.sql
-- 前提：已在 todo_sql 跑過第 9 堂的 schema.sql、seed.sql。
-- 這個檔只動 demo_ 開頭的練習用表，不會改到第 9 堂的 lists / todos；重複執行也不會出錯。

-- 先清掉上次執行留下的練習表（順序：有外鍵指向別人的表先刪）
DROP TABLE IF EXISTS demo_todos;
DROP TABLE IF EXISTS demo_lists;
DROP TABLE IF EXISTS demo_todos_flat;

-- ========== 1. 沒正規化：清單名稱直接存成字串 ==========

CREATE TABLE demo_todos_flat (
  id        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title     VARCHAR(200) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  list_name VARCHAR(100)                 -- ← 清單名稱每一列都存一次
);

INSERT INTO demo_todos_flat (title, completed, list_name) VALUES
  ('寫專案週報',       true,  '工作'),
  ('修登入頁的 bug',   false, '工作'),
  ('回覆客戶信件',     false, '工做'),   -- ← 有人打錯字，現在「工作」有兩種寫法
  ('買牛奶',           false, '生活'),
  ('預約看牙醫',       false, '生活'),
  ('學會 SQL JOIN',    false, '學習');

-- 問題 1：同一個清單的名稱重複存好幾次，打錯字就分裂成兩個清單
SELECT list_name, COUNT(*) AS n
FROM demo_todos_flat
GROUP BY list_name
ORDER BY list_name;

-- 問題 2：想把「工作」改名成「公司」，要改每一列；漏改的那列（工做）就對不起來
UPDATE demo_todos_flat SET list_name = '公司' WHERE list_name = '工作';
SELECT title, list_name FROM demo_todos_flat ORDER BY id;

-- 把錯字和改名都還原，準備開始拆表
UPDATE demo_todos_flat SET list_name = '工作' WHERE list_name IN ('公司', '工做');

-- ========== 2. 正規化：拆成兩張表，用外鍵連起來 ==========

-- 「一」邊：每個清單名稱只存一次
CREATE TABLE demo_lists (
  id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE       -- UNIQUE：同一個名稱不能存兩次
);

-- 「多」邊：只存清單的 id（外鍵），不再存名稱
CREATE TABLE demo_todos (
  id        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title     VARCHAR(200) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  list_id   INT REFERENCES demo_lists(id) ON DELETE SET NULL
);

-- 搬資料 step 1：把不重複的清單名稱搬進 demo_lists
--（GROUP BY 讓每個名稱只出現一次；ORDER BY MIN(id) 讓清單照第一次出現的順序編號）
INSERT INTO demo_lists (name)
SELECT list_name
FROM demo_todos_flat
WHERE list_name IS NOT NULL
GROUP BY list_name
ORDER BY MIN(id);

-- 搬資料 step 2：用名稱 JOIN 找到對應的 id，搬進 demo_todos
INSERT INTO demo_todos (title, completed, list_id)
SELECT f.title, f.completed, l.id
FROM demo_todos_flat f
LEFT JOIN demo_lists l ON l.name = f.list_name
ORDER BY f.id;

SELECT * FROM demo_lists ORDER BY id;
SELECT * FROM demo_todos ORDER BY id;

-- ========== 3. 用第 9 堂學的 JOIN 拼回原本的樣子 ==========

SELECT t.title, t.completed, l.name AS list_name
FROM demo_todos t
LEFT JOIN demo_lists l ON l.id = t.list_id
ORDER BY t.id;

-- ========== 4. 正規化的好處：改名只要改一個地方 ==========

UPDATE demo_lists SET name = '公司' WHERE name = '工作';   -- 只動 1 列

SELECT t.title, l.name AS list_name
FROM demo_todos t
LEFT JOIN demo_lists l ON l.id = t.list_id
ORDER BY t.id;

-- 外鍵也會擋掉「指向不存在清單」的資料（想試的話在 psql 手動貼，會出現 ERROR）：
-- INSERT INTO demo_todos (title, list_id) VALUES ('孤兒 todo', 999);

-- 拆完的 demo_lists + demo_todos，結構跟第 9 堂的 lists + todos 一模一樣。
