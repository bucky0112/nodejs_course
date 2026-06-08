import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg' // pg 是 CommonJS 套件，所以用 default 匯入再解構
import * as schema from './schema.js'

const { Pool } = pg

// 連線池：重複使用連線，不必每次查詢都重連
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// 傳入 schema 可啟用 Query API（關聯查詢，M3 會用到）
export const db = drizzle(pool, { schema })
