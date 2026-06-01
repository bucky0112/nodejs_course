# 使用 Node.js 20 slim 版本作為基礎映像檔
FROM node:20-slim

# 設定工作目錄
WORKDIR /app

# 先複製 package 檔案（利用 Docker 快取層）
COPY package*.json ./

# 安裝 production 依賴
RUN npm ci --omit=dev

# 複製其餘程式碼
COPY . .

# 設定環境變數
ENV NODE_ENV=production

# Railway 會透過環境變數注入 PORT
EXPOSE ${PORT:-3000}

# 啟動應用程式
CMD ["node", "index.js"]
