# 什麼是 Supabase？

## 簡介

Supabase 是一個開源的 **Backend-as-a-Service (BaaS)** 平台，被稱為「開源版的 Firebase」。它提供了一套完整的後端服務，讓開發者可以快速建立應用程式，而不需要自己架設和維護伺服器。

## 核心功能

| 功能 | 說明 |
|------|------|
| **PostgreSQL 資料庫** | 完整的關聯式資料庫，支援 SQL 查詢 |
| **Authentication** | 內建使用者認證（Email、OAuth、Magic Link） |
| **Realtime** | 即時資料訂閱，資料變更時自動推送 |
| **Storage** | 檔案儲存服務（圖片、影片、文件） |
| **Edge Functions** | Serverless 函式（類似 AWS Lambda） |
| **Row Level Security** | 資料庫層級的權限控制 |

## 與其他方案比較

| 特性 | 傳統 PostgreSQL | Supabase | Firebase |
|------|----------------|----------|----------|
| 資料庫類型 | 關聯式 (SQL) | 關聯式 (SQL) | NoSQL (文件) |
| 自架需求 | 需要 | 不需要 | 不需要 |
| 即時訂閱 | 自己實作 WebSocket | 內建 | 內建 |
| 認證系統 | 自己實作 | 內建 | 內建 |
| ORM 支援 | Drizzle / Prisma | Drizzle / Prisma + JS Client | SDK only |
| 免費方案 | 自架成本 | 500MB / 2 專案 | 1GB / 有限制 |
| 開源 | ✅ | ✅ | ❌ |
| SQL 支援 | ✅ 完整 | ✅ 完整 | ❌ |
| 資料遷移 | 簡單 | 簡單（標準 PostgreSQL） | 複雜 |

## 為什麼選擇 Supabase？

### 相較於傳統 PostgreSQL

- **省時**：不需要自己架設資料庫伺服器
- **附加功能**：內建認證、即時訂閱、檔案儲存
- **可攜性**：底層就是標準 PostgreSQL，隨時可以遷移

### 相較於 Firebase

- **SQL 支援**：使用熟悉的 SQL 語法，而非 NoSQL
- **開源**：可以自架，不被廠商綁定
- **彈性**：可以用 Drizzle/Prisma 等 ORM，也可以用官方 SDK

## Supabase 的兩種使用方式

在本課程中，我們會學習兩種連接 Supabase 的方式：

### 1. Supabase JS Client（官方 SDK）

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)

// 查詢資料
const { data, error } = await supabase
  .from('notes')
  .select('*')
```

**優點**：
- 簡單快速，適合快速開發
- 內建 Realtime 和 Auth 功能
- 前後端都可以使用

### 2. 直接 PostgreSQL 連線（Drizzle ORM）

```javascript
import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'

const pool = new pg.Pool({
  connectionString: DATABASE_URL
})
const db = drizzle(pool)

// 查詢資料
const notes = await db.select().from(notesTable)
```

**優點**：
- 與現有課程銜接，使用熟悉的 Drizzle
- 完整的 SQL 控制能力
- 更容易遷移到其他 PostgreSQL 服務

## 本章學習目標

透過三個 Demo，你將學會：

| Demo | 學習重點 | 使用方式 |
|------|---------|---------|
| Notes API | Supabase 作為 PostgreSQL 替代 | Drizzle ORM |
| Realtime Chat | 即時資料訂閱 | JS Client |
| Todo + Auth | 使用者認證整合 | JS Client |

準備好了嗎？讓我們開始設定 Supabase 專案！
