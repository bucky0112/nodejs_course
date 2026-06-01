# Docker Compose

## 為什麼需要 Docker Compose？

想像一個完整的應用程式需要：
- Node.js API 伺服器
- PostgreSQL 資料庫
- Redis 快取（選用）

用單純的 `docker run` 要執行很多指令：

```bash
# 建立網路
docker network create my-network

# 啟動資料庫
docker run -d --name db --network my-network \
  -e POSTGRES_PASSWORD=secret postgres:16

# 啟動應用程式
docker run -d --name app --network my-network \
  -p 3000:3000 -e DATABASE_URL=... my-app
```

**Docker Compose** 讓你用**一個 YAML 檔案**定義所有服務，然後**一行指令**啟動全部！

## docker-compose.yml 基本結構

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://...
    depends_on:
      - db

  db:
    image: postgres:16
    environment:
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=myapp
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

## 常用指令

```bash
# 啟動所有服務（背景執行）
docker compose up -d

# 查看服務狀態
docker compose ps

# 查看日誌
docker compose logs

# 追蹤特定服務日誌
docker compose logs -f app

# 停止所有服務
docker compose down

# 停止並刪除資料卷（清除資料庫）
docker compose down -v

# 重新建置映像檔
docker compose build

# 重新建置並啟動
docker compose up -d --build
```

## 實戰：Notes API + PostgreSQL

我們用課程中的 `notes_api_demo` 來實作！

### 專案結構

```
docker_demo/
├── src/
│   ├── app.js
│   ├── config/
│   ├── controllers/
│   ├── db/
│   ├── middleware/
│   ├── routes/
│   └── services/
├── index.js
├── package.json
├── package-lock.json
├── drizzle.config.js
├── Dockerfile
├── docker-compose.yml
├── docker-compose.dev.yml
├── .dockerignore
└── .env.template
```

### Dockerfile

```dockerfile
FROM node:20-slim

WORKDIR /app

# 安裝依賴
COPY package*.json ./
RUN npm ci --only=production

# 複製程式碼
COPY . .

# 設定環境變數
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "index.js"]
```

### docker-compose.yml（生產環境）

```yaml
services:
  # Node.js API 服務
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=postgresql://admin:secret123@db:5432/notes_app
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  # PostgreSQL 資料庫
  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=secret123
      - POSTGRES_DB=notes_app
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin -d notes_app"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  postgres_data:
```

**重點解說：**

| 設定 | 說明 |
|------|------|
| `depends_on` | app 會等 db 啟動後才啟動 |
| `condition: service_healthy` | 等到資料庫健康檢查通過 |
| `healthcheck` | 定期檢查資料庫是否可連線 |
| `volumes` | 資料持久化，重啟不會遺失資料 |
| `restart: unless-stopped` | 除非手動停止，否則自動重啟 |

### docker-compose.dev.yml（開發環境）

開發時我們需要：
- **Hot Reload**：程式碼變更即時生效
- **暴露資料庫連接埠**：方便用工具連線

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - PORT=3000
      - DATABASE_URL=postgresql://admin:secret123@db:5432/notes_app
    volumes:
      # 掛載本地程式碼，實現 hot reload
      - .:/app
      - /app/node_modules
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=secret123
      - POSTGRES_DB=notes_app
    ports:
      # 開發時暴露資料庫連接埠
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin -d notes_app"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### Dockerfile.dev（開發用）

```dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV=development
ENV PORT=3000

EXPOSE 3000

# 使用 nodemon 實現 hot reload
CMD ["npm", "run", "dev"]
```

## 開發流程

### 1. 啟動開發環境

```bash
# 使用開發設定檔啟動
docker compose -f docker-compose.dev.yml up -d

# 或建立別名（在 package.json scripts 中）
npm run docker:dev
```

### 2. 查看日誌

```bash
# 查看所有服務日誌
docker compose -f docker-compose.dev.yml logs -f

# 只看 app 日誌
docker compose -f docker-compose.dev.yml logs -f app
```

### 3. 執行資料庫遷移

```bash
# 進入 app 容器執行指令
docker compose -f docker-compose.dev.yml exec app npm run migrate
```

### 4. 連線資料庫（除錯用）

```bash
# 用 psql 連線
docker compose -f docker-compose.dev.yml exec db psql -U admin -d notes_app
```

### 5. 停止環境

```bash
# 停止服務（保留資料）
docker compose -f docker-compose.dev.yml down

# 停止並清除資料（重新開始）
docker compose -f docker-compose.dev.yml down -v
```

## 進階設定

### 使用 .env 檔案

建立 `.env` 檔案：

```env
POSTGRES_USER=admin
POSTGRES_PASSWORD=secret123
POSTGRES_DB=notes_app
DATABASE_URL=postgresql://admin:secret123@db:5432/notes_app
```

修改 `docker-compose.yml`：

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    env_file:
      - .env
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

### 容器間網路

Docker Compose 會自動建立網路，服務間可以用**服務名稱**互相連線：

```
┌─────────────────────────────────────────┐
│         docker_demo_default             │  ← 自動建立的網路
│                                         │
│  ┌─────────┐         ┌─────────┐       │
│  │   app   │ ──────► │   db    │       │
│  │         │         │         │       │
│  │ :3000   │         │ :5432   │       │
│  └─────────┘         └─────────┘       │
└─────────────────────────────────────────┘
        │
        ▼
   localhost:3000  ← 只有 app 暴露給主機
```

在 app 容器中，可以用 `db:5432` 連線到資料庫（`db` 是服務名稱）。

### 加入 package.json scripts

```json
{
  "scripts": {
    "dev": "nodemon index.js",
    "start": "node index.js",
    "docker:dev": "docker compose -f docker-compose.dev.yml up -d",
    "docker:dev:logs": "docker compose -f docker-compose.dev.yml logs -f",
    "docker:dev:down": "docker compose -f docker-compose.dev.yml down",
    "docker:prod": "docker compose up -d --build",
    "docker:prod:down": "docker compose down"
  }
}
```

## 完整開發流程範例

```bash
# 1. Clone 專案
git clone <repo-url>
cd docker_demo

# 2. 複製環境變數範本
cp .env.template .env

# 3. 啟動開發環境
npm run docker:dev

# 4. 執行資料庫遷移（首次）
docker compose -f docker-compose.dev.yml exec app npm run push

# 5. 開始開發！
# 修改程式碼，儲存後會自動重新載入

# 6. 查看日誌
npm run docker:dev:logs

# 7. 結束開發
npm run docker:dev:down
```

## 小結

這一章學到了：

- ✅ Docker Compose 基本概念和語法
- ✅ 同時管理 App + PostgreSQL
- ✅ 開發環境的 Hot Reload 設定
- ✅ 資料持久化（volumes）
- ✅ 健康檢查（healthcheck）

下一章會學習如何把應用部署到 Railway！
