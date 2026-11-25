-- 第 10 堂完成版：交易（BEGIN / COMMIT / ROLLBACK）
-- 執行方式：psql -d todo_sql -f transaction.sql
-- 前提：已在 todo_sql 跑過第 9 堂的 schema.sql、seed.sql（queries.sql 跑過也沒關係）。
-- 這個檔重複執行也不會出錯。

-- ========== 1. ROLLBACK：反悔，當作什麼都沒發生 ==========

-- 動手前先看：「生活」清單（id = 2）底下有幾筆 todo
SELECT COUNT(*) AS before_count FROM todos WHERE list_id = 2;

BEGIN;
DELETE FROM todos WHERE list_id = 2;

-- 交易還沒結束：在「這個連線」裡看，資料已經不見了
SELECT COUNT(*) AS inside_tx_count FROM todos WHERE list_id = 2;

-- 糟糕，刪錯清單了 → 全部撤回
ROLLBACK;

-- 交易結束後再看一次：資料回來了，跟 before_count 一樣
SELECT COUNT(*) AS after_rollback_count FROM todos WHERE list_id = 2;

-- ========== 2. COMMIT：兩個操作綁成「全有或全無」 ==========

-- 情境：「工作」清單的兩筆事做完了 →
--   (a) 標成完成
--   (b) 拿掉它們的「緊急」標籤（tag id = 1）
-- 這兩步要嘛一起生效、要嘛都不要生效，不能只做一半。

BEGIN;
UPDATE todos SET completed = true WHERE id IN (1, 2);
DELETE FROM todo_tags WHERE todo_id IN (1, 2) AND tag_id = 1;
-- 確認結果沒問題，才 COMMIT
SELECT t.id, t.title, t.completed, tg.name AS tag
FROM todos t
LEFT JOIN todo_tags tt ON tt.todo_id = t.id
LEFT JOIN tags tg      ON tg.id = tt.tag_id
WHERE t.id IN (1, 2);
COMMIT;

-- ========== 3. 出錯的交易（請在 psql 裡手動貼，不要整檔執行） ==========
-- 交易裡只要有一句出錯，整個交易就壞掉了，之後的指令都會被拒絕，
-- 只能 ROLLBACK。下面這段故意出錯，所以註解起來，請一行一行貼進 psql 觀察：
--
-- BEGIN;
-- UPDATE todos SET completed = true WHERE id = 4;
-- INSERT INTO todos (title) VALUES (NULL);   -- ✗ title 是 NOT NULL → ERROR
-- SELECT * FROM todos WHERE id = 4;          -- ✗ ERROR: current transaction is aborted ...
-- ROLLBACK;                                  -- 只能撤回；連第一句 UPDATE 也一起撤回了
