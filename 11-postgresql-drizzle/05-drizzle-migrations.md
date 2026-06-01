# Migration 資料庫遷移

**Migration 是 ORM 的精髓**，它讓資料庫結構的變更可以被追蹤、版本控制，並在不同環境間同步。

---

## 為什麼需要 Migration？

### 問題情境

想像以下情況：

1. 你在本地開發時新增了一個 `avatar` 欄位
2. 你的同事也在開發，他不知道你改了資料庫結構
3. 部署到正式環境時，資料庫結構跟程式碼不同步
4. **結果**：程式炸了 💥

### 沒有 Migration 的做法

```sql
-- 開發時
ALTER TABLE users ADD COLUMN avatar VARCHAR(255);

-- 然後...你要記得在測試環境執行一次
-- 然後...你要記得在正式環境執行一次
-- 然後...你的同事也要在他的本地執行一次
-- 然後...新人加入時也要知道要執行這些指令
-- 然後...你忘了哪些已經執行過了...
```

### 有 Migration 的做法

```bash
# 1. 修改 schema.js
# 2. 執行 generate，自動產生 SQL 檔案
# 3. 執行 migrate，套用到資料庫
# 4. 把 migration 檔案 commit 到 git
# 5. 其他人 pull 後執行 migrate 即可同步
```

---

## Migration 的核心概念

| 概念 | 說明 |
|------|------|
| **Migration 檔案** | 描述資料庫結構變更的 SQL 檔案 |
| **版本控制** | 每次變更產生一個新檔案，可追蹤歷史 |
| **順序執行** | Migration 會依序執行，確保結構正確 |
| **可重現** | 任何人都可以從零開始建立相同的資料庫結構 |

```
drizzle/
├── 0000_initial.sql        ← 第一次建立表格
├── 0001_add_avatar.sql     ← 新增 avatar 欄位
├── 0002_add_is_admin.sql   ← 新增 is_admin 欄位
└── meta/
    ├── _journal.json       ← 記錄執行過哪些 migration
    └── 0000_snapshot.json  ← 每次的 schema 快照
```

---

## Drizzle Kit 指令

Drizzle Kit 是 Drizzle 的 CLI 工具，用來管理 Migration。

### 主要指令

| 指令 | 說明 | 使用時機 |
|------|------|----------|
| `drizzle-kit generate` | 根據 schema 產生 SQL 檔案 | 每次修改 schema 後 |
| `drizzle-kit migrate` | 執行尚未執行的 migration | 套用變更到資料庫 |
| `drizzle-kit push` | 直接推送 schema 到資料庫 | 開發階段快速同步 |
| `drizzle-kit studio` | 開啟視覺化資料庫管理工具 | 查看和編輯資料 |

### generate vs push

| 指令 | 說明 | 適用情境 |
|------|------|----------|
| `generate` + `migrate` | 產生 SQL 檔案，再執行 | ✅ 正式流程，有版本控制 |
| `push` | 直接同步，不產生檔案 | ⚠️ 開發階段快速測試 |

> 💡 **建議**：開發初期可以用 `push` 快速測試，確定 schema 後再用 `generate` 產生正式的 migration 檔案。

---

## Migration 工作流程

### 步驟 1：確認 drizzle.config.js 設定正確

```javascript
import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.js',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL
  }
})
```

### 步驟 2：定義 Schema

```javascript
// src/db/schema.js
import { pgTable, serial, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core'

export const usersTable = pgTable("users", {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow()
})

export const notesTable = pgTable("notes", {
  id: serial().primaryKey(),
  title: varchar({ length: 255 }).notNull(),
  content: text(),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
})
```

### 步驟 3：執行 generate

```bash
npm run generate
# 或
npx drizzle-kit generate
```

輸出：

```
[✓] 2 tables detected
[✓] Migration file created: drizzle/0000_initial.sql
```

### 步驟 4：檢查生成的 SQL

```sql
-- drizzle/0000_initial.sql
CREATE TABLE IF NOT EXISTS "users" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar(100) NOT NULL,
    "email" varchar(255) NOT NULL,
    "created_at" timestamp DEFAULT now(),
    CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE IF NOT EXISTS "notes" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar(255) NOT NULL,
    "content" text,
    "user_id" integer,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

ALTER TABLE "notes"
ADD CONSTRAINT "notes_user_id_users_id_fk"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE cascade ON UPDATE no action;
```

> 💡 **重要**：務必檢查生成的 SQL 是否符合預期！

### 步驟 5：執行 migrate

```bash
npm run migrate
# 或
npx drizzle-kit migrate
```

輸出：

```
[✓] Running migrations
[✓] 0000_initial.sql executed successfully
[✓] All migrations completed
```

### 步驟 6：驗證結果

使用 Drizzle Studio 查看資料庫：

```bash
npm run studio
# 或
npx drizzle-kit studio
```

瀏覽器會開啟 `https://local.drizzle.studio`，可以看到你的表格！

---

## 實作練習：新增欄位

### 情境：新增使用者頭像欄位

### 步驟 1：修改 schema.js

```javascript
export const usersTable = pgTable("users", {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  avatar: varchar({ length: 255 }),  // 🆕 新增這行
  createdAt: timestamp("created_at").defaultNow()
})
```

### 步驟 2：執行 generate

```bash
npm run generate
```

輸出：

```
[✓] Schema change detected
[✓] Migration file created: drizzle/0001_add_avatar.sql
```

### 步驟 3：檢查生成的 SQL

```sql
-- drizzle/0001_add_avatar.sql
ALTER TABLE "users" ADD COLUMN "avatar" varchar(255);
```

### 步驟 4：執行 migrate

```bash
npm run migrate
```

完成！現在 users 表格有 avatar 欄位了。

---

## 開發階段：使用 push

在開發初期，你可能會頻繁修改 schema。這時可以用 `push` 快速同步：

```bash
npm run push
# 或
npx drizzle-kit push
```

> ⚠️ **注意**：`push` 不會產生 migration 檔案，適合開發階段使用。
> 正式環境請使用 `generate` + `migrate`。

---

## 常見問題

### Q1：Migration 失敗怎麼辦？

1. 檢查錯誤訊息
2. 確認資料庫連線正確
3. 如果是結構衝突，可能需要手動修復

### Q2：如何回滾 (rollback) 變更？

Drizzle Kit 目前沒有內建 rollback 功能。

建議做法：
1. 手動寫一個新的 migration 來「撤銷」變更
2. 或者在開發階段使用 `push`，正式環境謹慎操作

### Q3：多人開發時的衝突？

1. 每個人修改 schema 後都要 `generate`
2. 把 migration 檔案 commit 到 git
3. Pull 後執行 `migrate` 同步

### Q4：可以刪除 migration 檔案嗎？

- 開發階段：可以刪除後重新 `generate`
- 正式環境：**絕對不要刪除**！其他環境可能已經執行過

---

## 團隊協作流程

```
┌─────────────────────────────────────────────┐
│                 團隊協作流程                  │
├─────────────────────────────────────────────┤
│                                             │
│  1. 開發者 A 修改 schema.js                  │
│         ↓                                   │
│  2. 執行 npm run generate                   │
│         ↓                                   │
│  3. 檢查生成的 SQL                           │
│         ↓                                   │
│  4. 執行 npm run migrate                    │
│         ↓                                   │
│  5. Commit: schema.js + drizzle/*.sql       │
│         ↓                                   │
│  6. Push 到 git                             │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  7. 開發者 B 從 git pull                     │
│         ↓                                   │
│  8. 執行 npm run migrate                    │
│         ↓                                   │
│  9. 資料庫結構同步完成！                      │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 重點回顧

| 概念 | 重點 |
|------|------|
| Migration | 資料庫結構的版本控制 |
| `generate` | 根據 schema 產生 SQL 檔案 |
| `migrate` | 執行尚未執行的 migration |
| `push` | 直接同步 schema（開發用） |
| `studio` | 視覺化資料庫管理工具 |

### 工作流程

```
修改 schema.js → generate → 檢查 SQL → migrate → commit
```

### 黃金法則

1. **每次修改 schema 後都要 generate**
2. **執行 migrate 前先檢查生成的 SQL**
3. **Migration 檔案要 commit 到 git**
4. **正式環境不要用 push**

---

## 下一章

現在我們已經把資料庫結構準備好了！

下一章會學習如何使用 Drizzle 進行 **CRUD 操作**：
- 查詢資料
- 新增資料
- 更新資料
- 刪除資料

你會發現，Drizzle 的語法跟 SQL 非常相似！
