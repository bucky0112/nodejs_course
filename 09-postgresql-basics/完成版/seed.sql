-- 第 9 堂完成版：測試資料
-- 執行方式：psql -d todo_sql -f seed.sql（需先跑過 schema.sql）

INSERT INTO lists (name) VALUES ('工作'), ('生活'), ('學習');

INSERT INTO todos (title, completed, list_id) VALUES
  ('寫專案週報',       true,  1),
  ('修登入頁的 bug',   false, 1),
  ('買牛奶',           false, 2),
  ('預約看牙醫',       false, 2),
  ('學會 SQL JOIN',    false, 3),
  ('讀完 Express 文件', true,  3);

INSERT INTO tags (name) VALUES ('緊急'), ('簡單'), ('長期');

-- 幫部分 todo 貼標籤
INSERT INTO todo_tags (todo_id, tag_id) VALUES
  (1, 1),   -- 寫專案週報 → 緊急
  (2, 1),   -- 修登入頁的 bug → 緊急
  (5, 3),   -- 學會 SQL JOIN → 長期
  (6, 2);   -- 讀完 Express 文件 → 簡單
