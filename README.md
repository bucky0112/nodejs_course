# Node.js 與 Express 教學專案

這是一個循序漸進的 Node.js 和 Express.js 教學專案，目的在幫助開發者從基礎開始學習 Node.js 和 Express 框架的開發。

每個章節都包含「講義（Markdown）」與「可獨立執行的範例專案（demo）」，範例都放在所屬章節資料夾內，方便對照學習。

## 課程大綱

### 基礎篇

| 章節 | 主題 | 內容 |
|------|------|------|
| 01 | Node.js 基礎 | Node.js 介紹、安裝、模組系統、非同步機制、Path、URL、HTTP |
| 02 | Express 基礎 | 路由、Middleware、錯誤處理 |
| 03 | SQL 教學 | SQL 基礎語法、CRUD、條件查詢、JOIN、聚合、集合運算 |
| 04 | SQL ORM | 使用 ORM 操作資料庫（monster_hero_api） |
| 05 | 關聯設計 | 一對多（1:N）、多對多（M:N）關聯實作 |

### 進階篇（檔案、認證、金流）

| 章節 | 主題 | 內容 |
|------|------|------|
| 06 | 檔案上傳 | AWS S3 檔案上傳、圖片限制、用戶頭像 |
| 07 | Cookie & Session | HTTP 無狀態、Cookie、Session、Session vs JWT 比較 |
| 08 | JWT 認證 | JSON Web Token、密鑰管理、bcrypt 密碼加密 |
| 09 | OAuth | Google OAuth 第三方登入 |
| 10 | PayPal 金流 | PayPal SDK 整合、付款流程 |

### 資料庫篇

| 章節 | 主題 | 內容 |
|------|------|------|
| 11 | PostgreSQL + Drizzle | Drizzle ORM、遷移管理、關聯查詢、Notes API 實作 |
| 12 | Supabase | Supabase 介紹、資料庫 CRUD、Realtime、Authentication |

### DevOps 篇

| 章節 | 主題 | 內容 |
|------|------|------|
| 13 | Docker | Docker 介紹、Dockerfile、Docker Compose、部署到 Railway、安全沙箱 |

## 各章節範例專案

| 範例 | 位置 | 說明 |
|------|------|------|
| `async_demo` | `01-about-nodejs/async_demo` | 同步 vs 非同步檔案讀取 |
| `monster_hero_api` | `04-sql-orm/monster_hero_api` | ORM 操作資料庫 |
| `many_demo` | `05-relations/many_demo` | 多對多關聯實作（Users、Posts、Likes） |
| `image-upload-s3` | `06-upload-to-s3/image-upload-s3` | S3 基礎圖片上傳 |
| `aws_full_demo` | `06-upload-to-s3/aws_full_demo` | S3 整合 + 用戶頭像管理（進階版） |
| `session_demo` | `07-cookie-session/session_demo` | Cookie / Session 實作 |
| `jwt_demo` | `08-jwt/jwt_demo` | JWT 認證後端 |
| `google_oauth` | `09-oauth/google_oauth` | Google OAuth 第三方登入 |
| `paypal_demo` | `10-paypal/paypal_demo` | PayPal 付款整合 |
| `notes_api_demo` | `11-postgresql-drizzle/notes_api_demo` | PostgreSQL + Drizzle Notes API |
| `docker_demo` | `13-docker/docker_demo` | Docker 容器化範例（含 Docker Compose） |

## 技術棧

- **Runtime**: Node.js（ESM 模組）
- **Framework**: Express.js
- **Database**: PostgreSQL、Supabase
- **ORM**: Drizzle ORM
- **認證**: Session、JWT、Google OAuth
- **雲端服務**: AWS S3、PayPal
- **容器化**: Docker、Docker Compose
- **部署**: Railway

## 快速開始

```bash
# 進入任一範例專案
cd 07-cookie-session/session_demo

# 安裝依賴
npm install

# 設定環境變數（若該專案有 .env.template / .env.example）
cp .env.template .env

# 啟動開發伺服器
npm run dev
```

## 學習路徑建議

```
Node.js 基礎 → Express 基礎 → SQL 基礎 → SQL ORM → 關聯設計
                                                      ↓
        檔案上傳 (S3) → Cookie & Session → JWT → OAuth → PayPal 金流
                                                      ↓
              PostgreSQL + Drizzle → Supabase
                                                      ↓
                    Docker → 部署到 Railway
```

## 環境需求

- Node.js 18+
- PostgreSQL 14+（或使用 Docker）
- Docker Desktop（選用，用於容器化開發）
- npm 或 pnpm
