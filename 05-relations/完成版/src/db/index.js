import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg' // pg 是 CommonJS 套件，用 default 匯入再解構
import * as schema from './schema.js'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// 傳入 schema 才能用 db.query.xxx 的關聯查詢（Query API）
export const db = drizzle(pool, { schema })
