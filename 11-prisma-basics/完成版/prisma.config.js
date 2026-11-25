// Prisma 的設定檔：告訴 Prisma CLI schema 在哪、migration 放哪、連哪個資料庫。
import 'dotenv/config' // Prisma 7 不會自己讀 .env，要在這裡載入
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
