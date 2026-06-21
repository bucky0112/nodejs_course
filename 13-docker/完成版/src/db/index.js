import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg' // pg 是 CommonJS 套件，所以用 default 匯入再解構
import * as schema from './schema.js'

const { Pool } = pg

// 連線字串由環境變數注入。
// 在 Docker Compose 裡，主機名稱是另一個 service 的名字（這裡是 db），不是 localhost。
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const db = drizzle(pool, { schema })
