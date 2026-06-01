# SQL CRUD 操作

**CRUD** 是資料庫操作的四個基本動作：

| 操作 | SQL 指令 | 說明 |
|------|----------|------|
| **C**reate | `INSERT` | 新增資料 |
| **R**ead | `SELECT` | 讀取資料 |
| **U**pdate | `UPDATE` | 更新資料 |
| **D**elete | `DELETE` | 刪除資料 |

---

## 準備工作：建立測試資料

先在 pgAdmin 中執行以下 SQL，建立我們的練習環境：

```sql
-- 建立資料庫 (如果尚未建立)
CREATE DATABASE notes_app;

-- 切換到 notes_app 資料庫後，執行以下指令

-- 刪除舊表格 (如果存在)
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS users;

-- 建立 users 表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 建立 notes 表
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## INSERT：新增資料

### 基本語法

```sql
INSERT INTO 表格名 (欄位1, 欄位2, ...)
VALUES (值1, 值2, ...);
```

### 新增使用者

```sql
-- 新增單筆資料
INSERT INTO users (name, email)
VALUES ('小明', 'ming@example.com');

-- 新增多筆資料
INSERT INTO users (name, email)
VALUES
    ('小華', 'hua@example.com'),
    ('小美', 'mei@example.com'),
    ('小強', 'qiang@example.com');
```

> 💡 注意：`id` 和 `created_at` 不需要填寫，因為：
> - `id` 是 `SERIAL`，會自動遞增
> - `created_at` 有 `DEFAULT NOW()`，會自動填入當前時間

### 新增筆記 (含外鍵)

```sql
-- 為小明 (id=1) 新增筆記
INSERT INTO notes (title, content, user_id)
VALUES ('我的第一則筆記', '這是筆記內容...', 1);

-- 為小華 (id=2) 新增筆記
INSERT INTO notes (title, content, user_id)
VALUES
    ('學習 SQL', 'SQL 是結構化查詢語言', 2),
    ('學習 Node.js', 'Node.js 是 JavaScript 執行環境', 2);
```

### 回傳新增的資料

```sql
-- 新增後回傳該筆資料
INSERT INTO users (name, email)
VALUES ('小芳', 'fang@example.com')
RETURNING *;

-- 只回傳特定欄位
INSERT INTO users (name, email)
VALUES ('小偉', 'wei@example.com')
RETURNING id, name;
```

---

## SELECT：讀取資料

### 基本語法

```sql
SELECT 欄位 FROM 表格名 WHERE 條件;
```

### 查詢所有資料

```sql
-- 查詢所有欄位
SELECT * FROM users;

-- 查詢特定欄位
SELECT id, name, email FROM users;
```

### 條件查詢 (WHERE)

```sql
-- 查詢特定使用者
SELECT * FROM users WHERE id = 1;

-- 查詢名字是小明的使用者
SELECT * FROM users WHERE name = '小明';

-- 查詢特定使用者的所有筆記
SELECT * FROM notes WHERE user_id = 2;
```

### 結果排序 (ORDER BY)

```sql
-- 依建立時間降冪排序 (最新的在前面)
SELECT * FROM users ORDER BY created_at DESC;

-- 依名字升冪排序
SELECT * FROM users ORDER BY name ASC;
```

### 限制筆數 (LIMIT)

```sql
-- 只取前 3 筆
SELECT * FROM users LIMIT 3;

-- 取第 4~6 筆 (跳過前 3 筆，取 3 筆)
SELECT * FROM users LIMIT 3 OFFSET 3;
```

---

## UPDATE：更新資料

### 基本語法

```sql
UPDATE 表格名
SET 欄位1 = 值1, 欄位2 = 值2
WHERE 條件;
```

### 更新單筆資料

```sql
-- 更新 id=1 的使用者名字
UPDATE users
SET name = '王小明'
WHERE id = 1;

-- 更新多個欄位
UPDATE users
SET name = '王小華', email = 'wang.hua@example.com'
WHERE id = 2;
```

### 更新筆記的更新時間

```sql
UPDATE notes
SET content = '更新後的內容...', updated_at = NOW()
WHERE id = 1;
```

---

## ⚠️ UPDATE 危險警告

### 沒有 WHERE 會發生什麼事？

```sql
-- 🚨 危險！這會更新所有使用者的名字！
UPDATE users SET name = '路人甲';
```

**結果**：所有使用者的名字都變成「路人甲」！

### 經典災難案例

```sql
-- 工程師原本想更新 id=1 的使用者...
-- 但忘記加 WHERE 條件...

UPDATE users SET is_active = false;

-- 結果：所有使用者都被停用了 💀
```

### 最佳實踐：先 SELECT 再 UPDATE

```sql
-- 步驟 1：先確認要更新哪些資料
SELECT * FROM users WHERE id = 1;

-- 步驟 2：確認沒問題後，再執行 UPDATE
UPDATE users SET name = '新名字' WHERE id = 1;

-- 步驟 3：再次確認結果
SELECT * FROM users WHERE id = 1;
```

### 使用 RETURNING 確認更新結果

```sql
UPDATE users
SET name = '王小明'
WHERE id = 1
RETURNING *;
```

---

## DELETE：刪除資料

### 基本語法

```sql
DELETE FROM 表格名 WHERE 條件;
```

### 刪除單筆資料

```sql
-- 刪除 id=5 的使用者
DELETE FROM users WHERE id = 5;

-- 刪除特定筆記
DELETE FROM notes WHERE id = 3;
```

---

## ⚠️ DELETE 危險警告

### 沒有 WHERE 會發生什麼事？

```sql
-- 🚨 極度危險！這會刪除所有使用者！
DELETE FROM users;
```

**結果**：整張表的資料全部消失！而且**無法復原**！

### 經典災難案例

```sql
-- 半夜 3 點，工程師想刪除測試資料...
-- 複製貼上時忘記改 WHERE 條件...

DELETE FROM orders;  -- 原本想寫 WHERE status = 'test'

-- 結果：所有訂單資料都不見了 💀💀💀
```

### 最佳實踐：先 SELECT 再 DELETE

```sql
-- 步驟 1：先確認要刪除哪些資料
SELECT * FROM notes WHERE user_id = 3;

-- 步驟 2：確認這些是你真的要刪的
-- 步驟 3：再執行 DELETE
DELETE FROM notes WHERE user_id = 3;
```

### 使用 RETURNING 確認刪除的資料

```sql
DELETE FROM users
WHERE id = 5
RETURNING *;
```

---

## 外鍵約束與 CASCADE

### 外鍵約束會擋住刪除

如果 notes 表有參照 users 表的外鍵，直接刪除使用者會失敗：

```sql
-- 假設 user_id=1 有關聯的筆記
DELETE FROM users WHERE id = 1;

-- 錯誤訊息：
-- ERROR: update or delete on table "users" violates foreign key constraint
```

### 解決方法 1：先刪除關聯資料

```sql
-- 先刪除該使用者的所有筆記
DELETE FROM notes WHERE user_id = 1;

-- 再刪除使用者
DELETE FROM users WHERE id = 1;
```

### 解決方法 2：使用 CASCADE

在建立外鍵時設定 `ON DELETE CASCADE`：

```sql
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

這樣當刪除使用者時，其關聯的筆記會自動被刪除。

> ⚠️ CASCADE 很方便，但也很危險！請謹慎使用。

---

## 練習題

### 題目 1：新增資料

在 pgAdmin 中執行以下操作：

1. 新增 3 個使用者
2. 為每個使用者新增 2 則筆記

### 題目 2：查詢資料

1. 查詢所有使用者
2. 查詢 id=2 的使用者
3. 查詢所有筆記，依建立時間降冪排序
4. 查詢 user_id=1 的所有筆記

### 題目 3：更新資料

1. 更新 id=1 的使用者名字
2. 更新某則筆記的標題和內容，並更新 updated_at

### 題目 4：刪除資料

1. 刪除一則筆記
2. 嘗試刪除一個有筆記的使用者，觀察錯誤訊息

---

## 重點回顧

| 操作 | 指令 | 危險程度 |
|------|------|----------|
| INSERT | `INSERT INTO ... VALUES ...` | 🟢 安全 |
| SELECT | `SELECT ... FROM ... WHERE ...` | 🟢 安全 |
| UPDATE | `UPDATE ... SET ... WHERE ...` | 🟡 **務必加 WHERE** |
| DELETE | `DELETE FROM ... WHERE ...` | 🔴 **務必加 WHERE** |

### 黃金法則

1. **UPDATE 和 DELETE 一定要有 WHERE**
2. **先 SELECT 確認，再 UPDATE/DELETE**
3. **在正式環境操作前，先在測試環境驗證**

---

## 下一章

在下一章中，我們會學習更進階的查詢技巧：
- 條件運算子 (AND, OR, IN, LIKE)
- 分頁查詢 (ORDER BY, LIMIT, OFFSET)
- 關聯查詢 (JOIN)
- 聚合函數 (COUNT, SUM, AVG, GROUP BY)
