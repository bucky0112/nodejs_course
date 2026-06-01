# 撰寫 Dockerfile

## Dockerfile 是什麼？

Dockerfile 是一個**文字檔案**，裡面包含一系列指令，告訴 Docker 如何建立映像檔。

就像是一份「食譜」：
- 食材（基礎映像檔）
- 步驟（安裝套件、複製檔案）
- 完成品（你的應用程式映像檔）

## 基本結構

```dockerfile
# 1. 基礎映像檔
FROM node:20

# 2. 設定工作目錄
WORKDIR /app

# 3. 複製 package.json
COPY package*.json ./

# 4. 安裝依賴
RUN npm install

# 5. 複製其他程式碼
COPY . .

# 6. 暴露連接埠
EXPOSE 3000

# 7. 啟動指令
CMD ["node", "index.js"]
```

## 常用指令詳解

### FROM - 基礎映像檔

每個 Dockerfile 都必須以 `FROM` 開始：

```dockerfile
# 使用官方 Node.js 映像檔
FROM node:20

# 使用 Alpine 版本（更小）
FROM node:20-alpine

# 使用 slim 版本（較小但功能完整）
FROM node:20-slim
```

**映像檔大小比較：**

| 映像檔 | 大小 | 適用情境 |
|--------|------|----------|
| `node:20` | ~1.1GB | 完整功能，適合開發 |
| `node:20-slim` | ~240MB | 精簡版，適合生產環境 |
| `node:20-alpine` | ~180MB | 最小，但可能有相容性問題 |

### WORKDIR - 工作目錄

設定容器內的工作目錄：

```dockerfile
WORKDIR /app

# 之後的指令都會在 /app 目錄下執行
```

### COPY - 複製檔案

從本地複製檔案到容器：

```dockerfile
# 複製單一檔案
COPY package.json .

# 複製多個檔案（使用萬用字元）
COPY package*.json ./

# 複製整個目錄
COPY src/ ./src/

# 複製所有檔案
COPY . .
```

### RUN - 執行指令

在建立映像檔時執行指令：

```dockerfile
# 安裝套件
RUN npm install

# 執行多個指令（使用 && 連接）
RUN npm install && npm run build

# 多行指令（使用反斜線換行）
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean
```

### EXPOSE - 暴露連接埠

宣告容器會使用的連接埠：

```dockerfile
# 暴露單一連接埠
EXPOSE 3000

# 暴露多個連接埠
EXPOSE 3000 8080
```

> 📝 **注意**：`EXPOSE` 只是宣告，實際連接埠對應需要在 `docker run -p` 時指定。

### CMD - 啟動指令

容器啟動時執行的指令：

```dockerfile
# 陣列格式（推薦）
CMD ["node", "index.js"]

# 字串格式
CMD node index.js
```

### ENV - 環境變數

設定環境變數：

```dockerfile
# 設定單一變數
ENV NODE_ENV=production

# 設定多個變數
ENV NODE_ENV=production \
    PORT=3000
```

## 實戰：建立 Node.js API 映像檔

### 專案結構

```
my-api/
├── src/
│   └── app.js
├── package.json
├── package-lock.json
├── Dockerfile
└── .dockerignore
```

### 步驟 1：建立 .dockerignore

告訴 Docker 哪些檔案不需要複製：

```
# .dockerignore
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
```

> 💡 **為什麼不複製 node_modules？**
> - 本地的 node_modules 可能是針對不同 OS 編譯的
> - 在容器內重新 `npm install` 確保相容性

### 步驟 2：撰寫 Dockerfile

```dockerfile
# 使用 Node.js 20 slim 版本作為基礎
FROM node:20-slim

# 設定工作目錄
WORKDIR /app

# 先複製 package 檔案
COPY package*.json ./

# 安裝依賴（只安裝 production 依賴）
RUN npm ci --only=production

# 複製其餘程式碼
COPY . .

# 設定環境變數
ENV NODE_ENV=production
ENV PORT=3000

# 暴露連接埠
EXPOSE 3000

# 啟動應用程式
CMD ["node", "index.js"]
```

### 步驟 3：建立映像檔

```bash
# 建立映像檔（-t 指定名稱和標籤）
docker build -t my-api:1.0 .

# 建立時顯示詳細輸出
docker build -t my-api:1.0 . --progress=plain
```

### 步驟 4：執行容器

```bash
# 執行容器
docker run -d -p 3000:3000 --name my-api-container my-api:1.0

# 測試 API
curl http://localhost:3000

# 查看日誌
docker logs my-api-container
```

## 優化技巧

### 1. 利用快取層

Docker 會快取每一層。把**不常變動**的指令放前面：

```dockerfile
FROM node:20-slim
WORKDIR /app

# ✅ 好的做法：先複製 package 檔案
COPY package*.json ./
RUN npm ci --only=production

# 最後才複製程式碼（這層最常變動）
COPY . .

CMD ["node", "index.js"]
```

**為什麼這樣比較快？**
- 如果只改了程式碼，`npm install` 那層會使用快取
- 只有 `COPY . .` 這層需要重新建立

### 2. 使用 npm ci 而非 npm install

```dockerfile
# ✅ 推薦：使用 npm ci
RUN npm ci --only=production

# ❌ 避免：使用 npm install
RUN npm install
```

**npm ci 的優點：**
- 更快（跳過解析依賴）
- 更穩定（嚴格依照 package-lock.json）
- 更乾淨（會先刪除 node_modules）

### 3. 多階段建置（Multi-stage Build）

適合需要編譯的專案（如 TypeScript）：

```dockerfile
# 階段 1：建置
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 階段 2：執行（只包含必要檔案）
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/index.js"]
```

**優點：**
- 最終映像檔不包含開發依賴
- 映像檔更小、更安全

## 常見問題

### 問題 1：node_modules 權限錯誤

```dockerfile
# 使用非 root 用戶執行（更安全）
FROM node:20-slim

# 使用內建的 node 用戶
USER node

WORKDIR /home/node/app
COPY --chown=node:node . .
RUN npm ci --only=production

CMD ["node", "index.js"]
```

### 問題 2：映像檔太大

1. 使用 `-slim` 或 `-alpine` 基礎映像檔
2. 加入完整的 `.dockerignore`
3. 使用多階段建置
4. 只安裝 production 依賴

### 問題 3：每次建置都重新 npm install

確保 `COPY package*.json ./` 在 `COPY . .` 之前，才能利用快取。

## 小結

這一章學到了：

- ✅ Dockerfile 基本指令：`FROM`, `WORKDIR`, `COPY`, `RUN`, `CMD`
- ✅ 建立 Node.js 應用映像檔的最佳實踐
- ✅ 優化映像檔大小和建置速度

下一章會學習 Docker Compose，同時管理應用程式和資料庫。
