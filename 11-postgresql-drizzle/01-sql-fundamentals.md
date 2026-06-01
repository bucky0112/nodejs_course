# SQL 基礎概念

## 什麼是關聯式資料庫 (RDBMS)

**RDBMS** = Relational Database Management System（關聯式資料庫管理系統）

資料以「表格」的形式儲存，表格之間可以建立「關聯」，使用 SQL 語言進行操作。

### 核心概念

| 術語 | 說明 | 類比 |
|------|------|------|
| **Database** | 資料庫，資料的容器 | 一個 Excel 檔案 |
| **Table** | 表格，儲存特定類型的資料 | Excel 裡的一個工作表 |
| **Column** | 欄位，資料的屬性 | 工作表的欄標題 |
| **Row** | 列，一筆完整的資料記錄 | 工作表的一列資料 |
| **Primary Key (PK)** | 主鍵，唯一識別每筆資料 | 學號、身分證字號 |
| **Foreign Key (FK)** | 外鍵，建立表格間的關聯 | 參照其他表格的資料 |

### 用圖來理解

```
Database: school
├── Table: students
│   ├── id (PK)        ← 主鍵：唯一識別
│   ├── name
│   ├── email
│   └── class_id (FK)  ← 外鍵：連結到 classes 表
│
└── Table: classes
    ├── id (PK)
    ├── name
    └── teacher
```

---

## 主流的關聯式資料庫

| 資料庫 | 特點 | 授權 |
|--------|------|------|
| **PostgreSQL** | 功能強大、開源、適合學習與生產 | 免費 |
| **MySQL** | 普及度高、效能好 | 免費 (社群版) |
| **SQLite** | 輕量級、嵌入式、適合小型應用 | 免費 |
| **Oracle** | 企業級、功能完整 | 商業授權 💰 |
| **MSSQL** | 微軟生態系、與 .NET 整合好 | 商業授權 💰 |

> 本課程使用 **PostgreSQL**，因為它功能完整、開源免費、社群活躍，是學習關聯式資料庫的最佳選擇。

---

## 安裝 PostgreSQL

### macOS (使用 Homebrew)

```bash
# 安裝 PostgreSQL 16
brew install postgresql@16

# 啟動服務
brew services start postgresql@16

# 確認安裝成功
psql --version
```

### Windows

1. 前往 [PostgreSQL 官網](https://www.postgresql.org/download/windows/)
2. 下載 Windows 安裝程式
3. 執行安裝，記住設定的密碼
4. 安裝完成後會自動啟動服務

### Docker (推薦給進階使用者)

```bash
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -p 5432:5432 \
  postgres:16
```

---

## 安裝 pgAdmin

**pgAdmin** 是 PostgreSQL 的圖形化管理工具，讓你可以用視覺化介面操作資料庫。

### 安裝步驟

1. 前往 [pgAdmin 官網](https://www.pgadmin.org/download/)
2. 下載對應作業系統的版本
3. 安裝完成後開啟 pgAdmin

### 連接到本地 PostgreSQL

1. 開啟 pgAdmin
2. 右鍵點選「Servers」→「Register」→「Server」
3. 設定連線資訊：
   - **Name**: `Local PostgreSQL`
   - **Host**: `localhost`
   - **Port**: `5432`
   - **Username**: `postgres` (預設)
   - **Password**: 安裝時設定的密碼

### 使用 pgAdmin 的感受

> 💡 **教學重點**：先讓你體驗用 pgAdmin 手動操作的「痛苦」
>
> - 每次都要手動輸入 SQL 指令
> - 容易打錯語法、忘記分號
> - 沒有自動補全、難以維護
> - 沒有版本控制
>
> 這就是為什麼後面我們要學 ORM！

---

## 資料型態 (Data Types)

選擇正確的資料型態非常重要，它影響：
- 儲存空間
- 查詢效能
- 資料驗證

### 數字類型

| 型態 | 說明 | 範圍 | 使用場景 |
|------|------|------|----------|
| `INTEGER` / `INT` | 整數 | -2,147,483,648 ~ 2,147,483,647 | 數量、年齡 |
| `SERIAL` | 自動遞增整數 | 1 ~ 2,147,483,647 | 主鍵 (流水編號) |
| `BIGINT` | 大整數 | 超大範圍 | 超大 ID、時間戳 |
| `DECIMAL(p,s)` | 精確小數 | 自訂精度 | 金額 (避免浮點誤差) |
| `REAL` / `FLOAT` | 浮點數 | 近似值 | 科學計算 |

### 文字類型

| 型態 | 說明 | 使用場景 |
|------|------|----------|
| `CHAR(n)` | 固定長度，不足補空白 | 固定格式：身分證 (10 碼) |
| `VARCHAR(n)` | 可變長度，最大 n 字元 | 一般文字：名字、Email |
| `TEXT` | 無限長度 | 長文章、內容 |

> 💡 **面試題**：為什麼身分證字號要用 `CHAR(10)` 或 `VARCHAR(10)`，而不是 `INTEGER`？
>
> **答案**：因為身分證可能以 0 開頭（如 `A123456789`），用數字會丟失前導零。另外，身分證包含英文字母。

### 布林與日期

| 型態 | 說明 | 使用場景 |
|------|------|----------|
| `BOOLEAN` | `true` / `false` | 是否啟用、是否刪除 |
| `DATE` | 僅日期 (`2024-01-15`) | 生日、到期日 |
| `TIME` | 僅時間 (`14:30:00`) | 營業時間 |
| `TIMESTAMP` | 日期 + 時間 | 建立時間、更新時間 |

### 資料型態選擇建議

```
用途          → 型態
──────────────────────────
主鍵 ID       → SERIAL
短文字 (< 255) → VARCHAR(n)
長文字        → TEXT
是/否         → BOOLEAN
金額          → DECIMAL(10, 2)
時間戳        → TIMESTAMP
```

---

## DDL：定義資料結構

**DDL** = Data Definition Language（資料定義語言）

用來定義資料庫的結構，包括建立、修改、刪除資料庫和表格。

### 建立資料庫

```sql
-- 建立資料庫
CREATE DATABASE my_app;

-- 刪除資料庫 (危險！)
DROP DATABASE my_app;
```

### 建立表格 (CREATE TABLE)

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    age INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 約束 (Constraints)

約束是用來限制欄位的資料，確保資料的正確性。

| 約束 | 說明 | 範例 |
|------|------|------|
| `PRIMARY KEY` | 主鍵，唯一且非 NULL | `id SERIAL PRIMARY KEY` |
| `NOT NULL` | 必填，不能為空 | `name VARCHAR(100) NOT NULL` |
| `UNIQUE` | 唯一，不能重複 | `email VARCHAR(255) UNIQUE` |
| `DEFAULT` | 預設值 | `is_active BOOLEAN DEFAULT true` |
| `CHECK` | 自訂條件 | `age INTEGER CHECK (age >= 0)` |
| `FOREIGN KEY` | 外鍵，參照其他表格 | 下一章介紹 |

### 主鍵 (PRIMARY KEY)

每張表格都應該有一個主鍵，用來唯一識別每筆資料。

```sql
-- 方法 1：欄位後面直接加
id SERIAL PRIMARY KEY

-- 方法 2：單獨宣告
PRIMARY KEY (id)

-- 複合主鍵 (多欄位組合)
PRIMARY KEY (user_id, product_id)
```

> 💡 為什麼每張表都需要主鍵？
> - 唯一識別每筆資料
> - 其他表格可以透過外鍵參照
> - 提高查詢效能 (自動建立索引)

### 修改表格 (ALTER TABLE)

```sql
-- 新增欄位
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- 刪除欄位
ALTER TABLE users DROP COLUMN phone;

-- 修改欄位名稱
ALTER TABLE users RENAME COLUMN name TO username;

-- 新增約束
ALTER TABLE users ADD CONSTRAINT email_unique UNIQUE (email);
```

### 刪除表格 (DROP TABLE)

```sql
-- 刪除表格 (危險！資料會全部消失)
DROP TABLE users;

-- 如果表格存在才刪除 (避免錯誤)
DROP TABLE IF EXISTS users;
```

---

## 練習：建立 users 和 notes 表格

在 pgAdmin 中執行以下 SQL：

```sql
-- 建立資料庫
CREATE DATABASE notes_app;

-- 切換到該資料庫後，建立表格

-- 使用者表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 筆記表
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

> 💡 注意 `user_id INTEGER REFERENCES users(id)` 這行：
> 這就是 **外鍵 (Foreign Key)**，它建立了 notes 和 users 之間的關聯。
> 每則筆記都屬於一個使用者。

---

## 重點回顧

| 概念 | 重點 |
|------|------|
| Table | 儲存資料的表格 |
| Column | 欄位，定義資料的屬性 |
| Primary Key | 唯一識別每筆資料，每張表都需要 |
| Foreign Key | 建立表格間的關聯 |
| SERIAL | 自動遞增的整數，適合做主鍵 |
| VARCHAR(n) | 可變長度字串，最常用 |
| NOT NULL | 必填欄位 |
| UNIQUE | 不可重複 |
| DEFAULT | 預設值 |

---

## 下一章

在下一章中，我們會學習如何使用 SQL 進行 **CRUD 操作**：
- **C**reate (INSERT)
- **R**ead (SELECT)
- **U**pdate (UPDATE)
- **D**elete (DELETE)
