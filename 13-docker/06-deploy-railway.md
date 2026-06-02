# 部署到 Railway

## Railway 是什麼？

Railway 是一個現代化的雲端部署平台，特點：

- 🚀 **簡單部署**：連結 GitHub 即可自動部署
- 🐳 **支援 Docker**：偵測 Dockerfile 自動建置
- 💾 **內建資料庫**：一鍵建立 PostgreSQL、Redis 等
- 💰 **免費額度**：每月 $5 USD 免費額度（足夠學習使用）

## 部署方式比較

| 方式 | 說明 | 適用情境 |
|------|------|----------|
| **GitHub 部署** | 連結 repo，自動偵測並部署 | 最簡單，推薦 |
| **Docker Hub** | 推送到 Docker Hub，Railway 拉取 | 需要更多控制 |
| **Railway CLI** | 命令列部署 | 進階用法 |

本章使用 **GitHub 部署**，最簡單也最實用。

## 準備工作

### 1. 確認專案結構

```
docker_demo/
├── src/
├── index.js
├── package.json
├── package-lock.json
├── Dockerfile           ← Railway 會自動偵測
└── .gitignore
```

### 2. 調整 Dockerfile

Railway 需要一些調整：

```dockerfile
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production

# Railway 會自動注入 PORT 環境變數
EXPOSE ${PORT:-3000}

CMD ["node", "index.js"]
```

> 💡 **注意**：`npm ci` 需要 `package-lock.json` 檔案。如果沒有，先在本機執行 `npm install --package-lock-only` 生成。

### 3. 調整程式碼支援動態 PORT

Railway 會透過環境變數注入 PORT，確保程式碼有正確讀取：

```javascript
// index.js 或 src/config/index.js
const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`伺服器啟動於 port ${port}`)
})
```

### 4. 建立 railway.json（選用）

在專案根目錄建立 `railway.json` 提供更多設定：

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "node index.js",
    "healthcheckPath": "/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

## 部署步驟

### 步驟 1：推送到 GitHub

```bash
# 如果還沒有 repo
git init
git add .
git commit -m "Initial commit"

# 建立 GitHub repo 並推送
gh repo create docker_demo --public --push
# 或手動建立後
git remote add origin https://github.com/YOUR_USERNAME/docker_demo.git
git push -u origin main
```

### 步驟 2：註冊 Railway

1. 前往 [railway.app](https://railway.app/)
2. 點擊「Start a New Project」
3. 選擇「Deploy from GitHub repo」
4. 授權 GitHub 存取

### 步驟 3：建立 PostgreSQL 服務

1. 在 Railway 專案頁面，點擊「+ New」
2. 選擇「Database」→「Add PostgreSQL」
3. 等待資料庫建立完成
4. 點擊資料庫服務，複製 `DATABASE_URL`

```
┌─────────────────────────────────────────────┐
│  Railway Project                             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────┐                           │
│  │ PostgreSQL  │  ← 點擊查看連線資訊         │
│  │   (db)      │                           │
│  └─────────────┘                           │
│                                             │
│  [+ New]  ← 點擊新增服務                     │
│                                             │
└─────────────────────────────────────────────┘
```

### 步驟 4：部署應用程式

1. 點擊「+ New」→「GitHub Repo」
2. 選擇你的 `docker_demo` repo
3. Railway 會自動偵測 Dockerfile 並開始建置

### 步驟 5：設定環境變數

1. 點擊你的應用程式服務
2. 前往「Variables」分頁
3. 新增以下變數：

```
DATABASE_URL = ${{Postgres.DATABASE_URL}}
NODE_ENV = production
```

> 💡 `${{Postgres.DATABASE_URL}}` 是 Railway 的變數參照語法，會自動填入 PostgreSQL 的連線字串。

```
┌─────────────────────────────────────────────┐
│  Variables                                   │
├─────────────────────────────────────────────┤
│  DATABASE_URL  │ ${{Postgres.DATABASE_URL}} │
│  NODE_ENV      │ production                 │
│                                             │
│  [+ Add Variable]                           │
└─────────────────────────────────────────────┘
```

### 步驟 6：設定網域

1. 點擊應用程式服務
2. 前往「Settings」→「Networking」
3. 點擊「Generate Domain」
4. 你會得到一個類似 `https://xxx.up.railway.app` 的網址

### 步驟 7：執行資料庫遷移

> ⚠️ **重要**：`drizzle-kit` 是開發工具（在 `devDependencies`），Railway 的 production 環境不會安裝它。所以必須從**本機**執行 migrate，連接 Railway 的資料庫。

**正確做法：從本機執行 migrate**

```bash
# 1. 安裝 Railway CLI
npm install -g @railway/cli

# 2. 登入並連結專案
railway login
railway link

# 3. 取得 Railway 的公開資料庫 URL
railway variables | grep DATABASE_PUBLIC_URL

# 4. 在本機用公開 URL 執行 migrate
DATABASE_URL="postgresql://postgres:xxx@xxx.railway.app:xxxxx/railway" npm run migrate
```

**為什麼要用 `DATABASE_PUBLIC_URL`？**

| 變數 | 用途 | 可從哪裡連線 |
|------|------|-------------|
| `DATABASE_URL` | Railway 內部網路 | 只能從 Railway 服務連 |
| `DATABASE_PUBLIC_URL` | 公開網路 | 可以從本機、任何地方連 |

部署的應用程式用 `DATABASE_URL`（內部，更快），本機執行 migrate 用 `DATABASE_PUBLIC_URL`（外部）。

## 部署完成檢查

### 1. 查看部署日誌

在 Railway 控制台點擊你的服務 →「Deployments」→ 選擇最新部署 →「View Logs」

```
Building...
Step 1/7 : FROM node:20-slim
Step 2/7 : WORKDIR /app
...
Deploy successful!
```

### 2. 測試 API

```bash
# 測試你的 API
curl https://your-app.up.railway.app/health

# 測試其他 endpoints
curl https://your-app.up.railway.app/api/notes
```

### 3. 查看執行日誌

在服務頁面點擊「Logs」查看即時日誌。

## 自動部署

Railway 預設會監聽 GitHub：

- 推送到 `main` 分支 → 自動觸發部署
- 可以在 Settings 中調整觸發分支

```bash
# 本地開發完成後
git add .
git commit -m "Add new feature"
git push origin main

# Railway 會自動開始新的部署
```

## Railway 常用操作

### 查看資料庫內容

1. 點擊 PostgreSQL 服務
2. 前往「Data」分頁
3. 可以直接在網頁上執行 SQL

### 重新部署

1. 前往「Deployments」
2. 點擊「Redeploy」或「Rollback」

### 環境變數管理

- `Raw Editor`：批次編輯所有變數
- `Shared Variables`：在多個服務間共享變數

### 擴展服務

Railway 的免費方案有資源限制，升級後可以調整：
- CPU / Memory
- 副本數量（Replicas）
- 休眠設定

## 資料庫資料同步

將本機 Docker 開發環境的資料 dump 到 Railway 資料庫。

### 方法一：透過 docker compose exec（推薦）

```bash
# 確保 Docker 容器正在運行
docker compose -f docker-compose.dev.yml up -d

# 從 Docker 容器內的 PostgreSQL → Railway
docker compose -f docker-compose.dev.yml exec db \
  pg_dump -U admin notes_app | \
  psql "postgresql://postgres:xxx@xxx.railway.app:xxxxx/railway"
```

### 方法二：透過映射的 port

如果你的 `docker-compose.dev.yml` 有映射 port（例如 `5433:5432`）：

```bash
# 透過本機映射的 port 5433 連接 Docker 內的 PostgreSQL
pg_dump -h localhost -p 5433 -U admin -d notes_app | \
  psql "postgresql://postgres:xxx@xxx.railway.app:xxxxx/railway"
```

> ⚠️ **注意**：port 5433 是 Docker 映射出來的，不是本機原生的 PostgreSQL（通常是 5432）

### 方法三：先 dump 成檔案，再 restore

```bash
# 1. 啟動本地 Docker 資料庫（如果還沒啟動）
docker compose -f docker-compose.dev.yml up -d

# 2. Dump 本地資料（從容器內）
docker compose -f docker-compose.dev.yml exec db \
  pg_dump -U admin notes_app > backup.sql

# 3. 查看 dump 內容（確認有資料）
head -50 backup.sql

# 4. Restore 到 Railway（用 DATABASE_PUBLIC_URL）
psql "postgresql://postgres:xxx@xxx.railway.app:xxxxx/railway" < backup.sql
```

### 常用 pg_dump 選項

```bash
# 只 dump 資料（不含 schema，適合已經 migrate 過的情況）
docker compose -f docker-compose.dev.yml exec db \
  pg_dump --data-only -U admin notes_app > data-only.sql

# 只 dump 特定 table
docker compose -f docker-compose.dev.yml exec db \
  pg_dump -t users -t notes -U admin notes_app > tables.sql

# 清除目標資料庫的資料再匯入（危險！會刪除遠端所有資料）
docker compose -f docker-compose.dev.yml exec db \
  pg_dump --clean -U admin notes_app | \
  psql "postgresql://postgres:xxx@xxx.railway.app:xxxxx/railway"
```

### 情境對照表

| 情況 | 建議做法 |
|------|----------|
| Railway 已經 migrate 過 | 用 `--data-only` 只匯入資料 |
| Railway 是空的 | 直接 dump 全部（schema + data） |
| 有衝突（duplicate key） | 先清空 Railway 資料，或用 `--clean` |

### 其他平台

| 平台 | 外部連線 URL |
|------|-------------|
| Railway | `DATABASE_PUBLIC_URL` |
| Zeabur | Dashboard → PostgreSQL → Public connection |
| Render | Dashboard → External Database URL |
| Supabase | Dashboard → Connection string (Session mode) |

## 常見問題

### 問題 1：部署失敗 - npm ci 需要 package-lock.json

```
npm error The `npm ci` command can only install with an existing package-lock.json
```

**解法**：在本機生成 `package-lock.json` 並提交到 Git

```bash
# 生成 package-lock.json（不會安裝 node_modules）
npm install --package-lock-only

# 提交到 Git
git add package-lock.json
git commit -m "Add package-lock.json for npm ci"
git push
```

### 問題 2：部署失敗 - Port 相關

確保程式碼讀取 `process.env.PORT`：

```javascript
const port = process.env.PORT || 3000
```

### 問題 3：資料庫連線失敗

1. 確認 `DATABASE_URL` 環境變數已設定
2. 確認使用 `${{Postgres.DATABASE_URL}}` 語法
3. 在日誌中檢查連線錯誤訊息

### 問題 4：應用程式一直重啟

檢查啟動日誌是否有錯誤，常見原因：
- 缺少環境變數
- 資料庫遷移未執行
- 程式碼有 bug

### 問題 5：drizzle-kit: command not found

```
railway run npm run migrate
sh: drizzle-kit: command not found
```

**原因**：`drizzle-kit` 在 `devDependencies`，Railway production 環境不會安裝。

**解法**：從本機執行 migrate（參考「步驟 7：執行資料庫遷移」）

```bash
# 用本機的 drizzle-kit，連接 Railway 的資料庫
DATABASE_URL="$DATABASE_PUBLIC_URL" npm run migrate
```

### 問題 6：免費額度用完

Railway 免費方案每月有 $5 額度。用完後：
- 升級為付費方案
- 停止不需要的服務
- 下個月額度會重置

## 架構圖

```
┌─────────────────────────────────────────────────────┐
│                   Railway Cloud                      │
│                                                     │
│  ┌─────────────────┐     ┌─────────────────┐       │
│  │   Node.js App   │────►│   PostgreSQL    │       │
│  │   (Docker)      │     │   (Managed)     │       │
│  │                 │     │                 │       │
│  │  Port: $PORT    │     │  Port: 5432     │       │
│  └────────┬────────┘     └─────────────────┘       │
│           │                                         │
│           │ Railway Domain                          │
│           ▼                                         │
│  https://xxx.up.railway.app                         │
│                                                     │
└─────────────────────────────────────────────────────┘
            │
            │ HTTPS
            ▼
    ┌───────────────┐
    │    使用者      │
    └───────────────┘
```

## 小結

恭喜！你已經學會了完整的 Docker 開發到部署流程：

- ✅ **本地開發**：Docker Compose 管理 App + DB
- ✅ **版本控制**：Dockerfile 記錄環境設定
- ✅ **雲端部署**：Railway 自動偵測並部署
- ✅ **自動化**：推送 GitHub 即自動部署

### 下一步

- 試試其他平台（Render、Fly.io）
- 學習 CI/CD 自動化測試
- 探索 Kubernetes 進階部署
