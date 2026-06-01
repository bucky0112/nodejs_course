import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import config from './index.js'
import * as schema from '../db/schema.js'

const { Pool } = pg

// 建立 PostgreSQL 連線池
const pool = new Pool({
  connectionString: config.databaseUrl
})

// 建立 Drizzle ORM 客戶端
// 傳入 schema 以啟用 Query API (關聯查詢)
const db = drizzle(pool, { schema })

export default db
