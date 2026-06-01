# 設定 Supabase 專案與連線

本章節將帶你建立 Supabase 專案，並學習兩種連接資料庫的方式。

## 建立 Supabase 專案

### Step 1: 登入 Supabase Dashboard

1. 前往 [Supabase Dashboard](https://supabase.com/dashboard)
2. 使用 GitHub 或 Email 登入

### Step 2: 建立新專案

1. 點擊 **New Project**
2. 填寫專案資訊：
   - **Name**: `nodejs-course-demo`（或任意名稱）
   - **Database Password**: 設定一個強密碼（請記下來！）
   - **Region**: 選擇離你最近的區域（如 `Southeast Asia (Singapore)`）
3. 點擊 **Create new project**
4. 等待約 2 分鐘，專案建立完成

### Step 3: 取得連線資訊

專案建立後，前往 **Project Settings** > **API**，你會看到：

| 欄位 | 說明 | 用途 |
|------|------|------|
| Project URL | `https://xxx.supabase.co` | JS Client 連線 |
| Publishable key | `eyJhbGciOi...` | 前端/客戶端使用 |
| Secret key | `eyJhbGciOi...` | 後端使用（勿洩漏！） |

> ⚠️ 注意：Supabase 已將 API Keys 更新為新版本。請使用 **Publishable and secret API keys** 分頁取得金鑰，而非舊版的 Legacy anon/service_role keys。

前往 **Project Settings** > **Database**，你會看到：

| 欄位 | 說明 | 用途 |
|------|------|------|
| Connection string | `postgresql://postgres:...` | Drizzle/Prisma 連線 |

## 連線方式一：Supabase JS Client

這是官方推薦的方式，適合快速開發和使用 Supabase 特有功能（Realtime、Auth）。

### 安裝套件

```bash
npm install @supabase/supabase-js
```

### 初始化 Client

```javascript
// src/config/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### 基本操作範例

```javascript
// 查詢全部
const { data, error } = await supabase
  .from('notes')
  .select('*')

// 查詢單筆
const { data, error } = await supabase
  .from('notes')
  .select('*')
  .eq('id', 1)
  .single()

// 新增
const { data, error } = await supabase
  .from('notes')
  .insert({ title: 'Hello', content: 'World' })
  .select()

// 更新
const { data, error } = await supabase
  .from('notes')
  .update({ title: 'Updated' })
  .eq('id', 1)
  .select()

// 刪除
const { error } = await supabase
  .from('notes')
  .delete()
  .eq('id', 1)
```

## 連線方式二：Drizzle ORM

這種方式與現有課程一致，適合需要完整 SQL 控制的場景。

### 安裝套件

```bash
npm install drizzle-orm pg
npm install -D drizzle-kit
```

### 設定連線

```javascript
// src/config/database.js
import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as schema from '../db/schema.js'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

const db = drizzle(pool, { schema })

export default db
```

### 定義 Schema

```javascript
// src/db/schema.js
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  createdAt: timestamp('created_at').defaultNow()
})
```

### Drizzle 設定檔

```javascript
// drizzle.config.js
import 'dotenv/config'

export default {
  schema: './src/db/schema.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL
  }
}
```

### 執行 Migration

```bash
# 產生 migration 檔案
npx drizzle-kit generate

# 推送到資料庫
npx drizzle-kit push
```

## 環境變數設定

建立 `.env.template` 檔案：

```env
# Supabase JS Client
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-publishable-key

# Drizzle ORM (PostgreSQL 連線)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

> ⚠️ 注意：DATABASE_URL 中的密碼就是你建立專案時設定的資料庫密碼。

## 兩種方式的比較

| 特性 | JS Client | Drizzle ORM |
|------|-----------|-------------|
| 學習曲線 | 低 | 中（需學 Drizzle 語法） |
| SQL 控制 | 有限 | 完整 |
| Realtime 支援 | ✅ 內建 | ❌ 需另外實作 |
| Auth 整合 | ✅ 內建 | ❌ 需另外實作 |
| 型別安全 | 基本 | 完整（配合 TypeScript） |
| 遷移性 | Supabase 專用 | 可遷移到任何 PostgreSQL |

## 本課程的使用策略

| Demo | 連線方式 | 原因 |
|------|---------|------|
| Notes API | Drizzle ORM | 展示 Supabase 就是 PostgreSQL |
| Realtime Chat | JS Client | 需要 Realtime 功能 |
| Todo + Auth | JS Client | 需要 Auth 功能 |

接下來，讓我們開始實作第一個 Demo！
