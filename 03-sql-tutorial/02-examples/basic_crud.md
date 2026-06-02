# 基礎 CRUD 範例

## 新增資料表

```sql
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INTEGER,
    grade VARCHAR(2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 插入資料 (Create)

```sql
INSERT INTO students (name, age, grade) VALUES
    ('小明', 18, 'A'),
    ('小華', 17, 'B'),
    ('小美', 19, 'A');
```

## 查詢資料 (Read)

查詢所有學生：

```sql
SELECT * FROM students;
```

查詢特定條件的學生：

```sql
SELECT name, grade FROM students WHERE grade = 'A';
```

查詢年齡大於 18 的學生：

```sql
SELECT * FROM students WHERE age > 18;
```

## 更新資料 (Update)

更新小明的年級：

```sql
UPDATE students
SET grade = 'A+'
WHERE name = '小明';
```

更新多個欄位：

```sql
UPDATE students
SET age = 20, grade = 'B+'
WHERE name = '小華';
```

## 刪除資料 (Delete)

刪除特定學生：

```sql
DELETE FROM students
WHERE name = '小美';
```

刪除所有資料：

```sql
DELETE FROM students;
```

## 進階查詢範例

計算每個年級的平均年齡：

```sql
SELECT grade, AVG(age) as average_age
FROM students
GROUP BY grade;
```

使用 ORDER BY 排序：

```sql
SELECT * FROM students
ORDER BY age DESC; -- 從大到小，ASC 則相反
```

限制查詢結果數量：

```sql
SELECT * FROM students
LIMIT 2;
```
