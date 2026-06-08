-- S1 完成版：todo app 的資料庫 schema（PostgreSQL）
-- 執行方式：psql -d todo_sql -f schema.sql
--
-- 注意：id 用「GENERATED ALWAYS AS IDENTITY」而非舊式的 SERIAL。
-- 這是 PostgreSQL 10 之後推薦的標準 SQL 寫法。

-- 清單（lists）：一個清單有多個 todo（1:N 的「一」邊）
CREATE TABLE lists (
  id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- 待辦事項（todos）：核心資料表
CREATE TABLE todos (
  id         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title      VARCHAR(200) NOT NULL,
  completed  BOOLEAN NOT NULL DEFAULT FALSE,
  list_id    INT REFERENCES lists(id) ON DELETE SET NULL,  -- 1:N 外鍵；清單刪除時設為 NULL
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 標籤（tags）
CREATE TABLE tags (
  id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

-- todo 與 tag 的中介表（M:N）
CREATE TABLE todo_tags (
  todo_id INT NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
  tag_id  INT NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (todo_id, tag_id)   -- 複合主鍵：同一組 (todo, tag) 不重複
);
