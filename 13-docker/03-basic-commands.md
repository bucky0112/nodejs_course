# Docker 基礎指令

## 指令總覽

```
┌────────────────────────────────────────────────────┐
│                Docker 常用指令                      │
├────────────────────────────────────────────────────┤
│  映像檔 (Images)           容器 (Containers)        │
│  ─────────────────         ──────────────────      │
│  docker pull              docker run               │
│  docker images            docker ps                │
│  docker rmi               docker stop              │
│                           docker rm                │
│                           docker logs              │
│                           docker exec              │
└────────────────────────────────────────────────────┘
```

## 映像檔指令

### docker pull - 下載映像檔

從 Docker Hub 下載映像檔：

```bash
# 下載最新版 Node.js
docker pull node

# 下載特定版本
docker pull node:20

# 下載 PostgreSQL
docker pull postgres:16
```

### docker images - 列出映像檔

查看本地已下載的映像檔：

```bash
docker images
```

輸出範例：
```
REPOSITORY   TAG       IMAGE ID       CREATED        SIZE
node         20        abc123...      2 days ago     1.1GB
postgres     16        def456...      1 week ago     432MB
```

### docker rmi - 刪除映像檔

```bash
# 刪除特定映像檔
docker rmi node:20

# 強制刪除（即使有容器使用）
docker rmi -f node:20
```

## 容器指令

### docker run - 建立並執行容器

這是最常用的指令！

```bash
# 基本用法
docker run node:20

# 常用選項組合
docker run -d -p 3000:3000 --name my-app node:20
```

**重要參數：**

| 參數 | 說明 | 範例 |
|------|------|------|
| `-d` | 背景執行（detached） | `docker run -d ...` |
| `-p` | 連接埠對應 | `-p 主機埠:容器埠` |
| `--name` | 指定容器名稱 | `--name my-app` |
| `-e` | 設定環境變數 | `-e NODE_ENV=production` |
| `-v` | 掛載資料卷 | `-v /local:/container` |
| `-it` | 互動模式 | `docker run -it node bash` |
| `--rm` | 結束時自動刪除 | `docker run --rm ...` |

### 實作練習：啟動 PostgreSQL

```bash
# 啟動一個 PostgreSQL 資料庫
docker run -d \
  --name my-postgres \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=secret123 \
  -e POSTGRES_DB=myapp \
  -p 5432:5432 \
  postgres:16
```

分解說明：
- `-d`：背景執行
- `--name my-postgres`：容器名稱
- `-e`：設定資料庫帳號、密碼、資料庫名稱
- `-p 5432:5432`：將主機的 5432 port 對應到容器的 5432
- `postgres:16`：使用 PostgreSQL 16 映像檔

### docker ps - 列出容器

```bash
# 列出執行中的容器
docker ps

# 列出所有容器（包含已停止的）
docker ps -a
```

輸出範例：
```
CONTAINER ID   IMAGE         STATUS          PORTS                    NAMES
a1b2c3d4...    postgres:16   Up 5 minutes    0.0.0.0:5432->5432/tcp   my-postgres
```

### docker stop / start - 停止與啟動

```bash
# 停止容器
docker stop my-postgres

# 啟動容器
docker start my-postgres

# 重啟容器
docker restart my-postgres
```

### docker rm - 刪除容器

```bash
# 刪除已停止的容器
docker rm my-postgres

# 強制刪除執行中的容器
docker rm -f my-postgres

# 刪除所有已停止的容器
docker container prune
```

### docker logs - 查看日誌

```bash
# 查看容器日誌
docker logs my-postgres

# 持續追蹤日誌（類似 tail -f）
docker logs -f my-postgres

# 只顯示最後 100 行
docker logs --tail 100 my-postgres
```

### docker exec - 進入容器

```bash
# 進入容器的 bash shell
docker exec -it my-postgres bash

# 直接執行指令
docker exec my-postgres psql -U admin -d myapp

# 執行 psql 互動模式
docker exec -it my-postgres psql -U admin -d myapp
```

## 實戰練習

### 練習 1：用 Docker 啟動 Node.js 互動環境

```bash
# 啟動 Node.js REPL
docker run -it --rm node:20

# 現在你可以直接輸入 JavaScript
> console.log('Hello Docker!')
Hello Docker!
> process.version
'v20.x.x'
> .exit
```

### 練習 2：完整的 PostgreSQL 操作

```bash
# 1. 啟動 PostgreSQL
docker run -d \
  --name pg-demo \
  -e POSTGRES_USER=demo \
  -e POSTGRES_PASSWORD=demo123 \
  -e POSTGRES_DB=testdb \
  -p 5432:5432 \
  postgres:16

# 2. 等待幾秒讓資料庫啟動

# 3. 連線到資料庫
docker exec -it pg-demo psql -U demo -d testdb

# 4. 在 psql 中執行 SQL
CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(100));
INSERT INTO users (name) VALUES ('Alice');
SELECT * FROM users;
\q

# 5. 查看日誌
docker logs pg-demo

# 6. 停止並清理
docker stop pg-demo
docker rm pg-demo
```

### 練習 3：執行一次性指令

```bash
# 用 Node.js 執行單一指令，執行後自動刪除容器
docker run --rm node:20 node -e "console.log('Node version:', process.version)"

# 用 npm 檢查版本
docker run --rm node:20 npm -v
```

## 清理指令

長期使用 Docker 會累積很多無用的資源：

```bash
# 刪除所有停止的容器
docker container prune

# 刪除未使用的映像檔
docker image prune

# 刪除未使用的資料卷
docker volume prune

# 一次清理全部（謹慎使用！）
docker system prune -a
```

## 指令速查表

```bash
# 映像檔
docker pull <image>        # 下載映像檔
docker images              # 列出映像檔
docker rmi <image>         # 刪除映像檔

# 容器
docker run <image>         # 執行容器
docker ps                  # 列出執行中容器
docker ps -a               # 列出所有容器
docker stop <container>    # 停止容器
docker start <container>   # 啟動容器
docker rm <container>      # 刪除容器
docker logs <container>    # 查看日誌
docker exec -it <c> bash   # 進入容器

# 清理
docker system prune        # 清理未使用資源
```

## 小結

這一章學到了：

- ✅ 映像檔操作：`pull`, `images`, `rmi`
- ✅ 容器操作：`run`, `ps`, `stop`, `start`, `rm`
- ✅ 除錯工具：`logs`, `exec`
- ✅ 實際用 Docker 啟動 PostgreSQL

下一章會學習如何撰寫 Dockerfile，把自己的 Node.js 應用打包成映像檔。
