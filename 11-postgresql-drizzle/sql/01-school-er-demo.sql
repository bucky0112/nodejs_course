-- ============================================
-- School Database - ER 圖範例
-- 用於展示主鍵 (PK) 和外鍵 (FK) 的關係
-- ============================================

-- 建立資料庫 (在 DBeaver 中先執行這行，或手動建立)
-- CREATE DATABASE school;

-- 切換到 school 資料庫後，執行以下指令

-- 刪除舊表格 (如果存在)
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS classes;

-- ============================================
-- 1. 建立 classes 表 (先建立，因為 students 要參照它)
-- ============================================
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,           -- 主鍵 (PK)
    name VARCHAR(100) NOT NULL,      -- 班級名稱
    teacher VARCHAR(100) NOT NULL    -- 導師姓名
);

-- ============================================
-- 2. 建立 students 表
-- ============================================
CREATE TABLE students (
    id SERIAL PRIMARY KEY,           -- 主鍵 (PK)
    name VARCHAR(100) NOT NULL,      -- 學生姓名
    email VARCHAR(255) UNIQUE,       -- 電子郵件 (唯一)
    class_id INTEGER REFERENCES classes(id)  -- 外鍵 (FK) → classes.id
);

-- ============================================
-- 3. 新增測試資料
-- ============================================

-- 新增班級
INSERT INTO classes (name, teacher) VALUES
    ('三年一班', '王老師'),
    ('三年二班', '李老師'),
    ('三年三班', '張老師');

-- 新增學生
INSERT INTO students (name, email, class_id) VALUES
    ('小明', 'ming@school.edu', 1),
    ('小華', 'hua@school.edu', 1),
    ('小美', 'mei@school.edu', 2),
    ('小強', 'qiang@school.edu', 2),
    ('小芳', 'fang@school.edu', 3);

-- ============================================
-- 4. 驗證資料
-- ============================================

-- 查詢所有班級
SELECT * FROM classes;

-- 查詢所有學生
SELECT * FROM students;

-- 查詢學生及其班級 (JOIN)
SELECT
    s.id AS student_id,
    s.name AS student_name,
    s.email,
    c.name AS class_name,
    c.teacher
FROM students s
INNER JOIN classes c ON s.class_id = c.id;
