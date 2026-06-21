# 基底映像：slim 版本比完整版小很多（少了一堆用不到的系統工具）
FROM node:22-slim

# 容器內的工作目錄，後續指令都在這裡執行
WORKDIR /app

# 先只複製 package 檔，單獨裝套件 —— 這樣只要 package 沒變，
# 改程式碼時 Docker 會重用「裝套件」這層快取，build 快很多。
COPY package*.json ./
RUN npm ci --omit=dev

# 再複製其餘程式碼（變動頻繁，放後面）
COPY . .

ENV NODE_ENV=production

# 文件性質的宣告：告訴讀者這個容器會用 3000
EXPOSE 3000

CMD ["node", "src/server.js"]
