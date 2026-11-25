// 讀 .env.test，把 DATABASE_URL 換成測試資料庫。
// override: true 讓它蓋過 .env 的設定；之後 src/db/prisma.js 的 dotenv 不會再覆蓋回去。
import { config } from 'dotenv'

const { error } = config({ path: '.env.test', override: true })
if (error) {
  throw new Error('找不到 .env.test：請複製 .env.test.example 成 .env.test，並設定測試資料庫的 DATABASE_URL')
}
