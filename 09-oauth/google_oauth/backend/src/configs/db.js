import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import 'dotenv/config'
import * as schema from '../db/schema.js'

const { Pool } = pg

// 建立 PostgreSQL 連線池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

// 建立 Drizzle ORM 客戶端
const db = drizzle(pool, { schema })

// 測試連線
pool.on('connect', () => {
  console.log('已連接 PostgreSQL 資料庫')
})

pool.on('error', (err) => {
  console.error('PostgreSQL 連線錯誤:', err.message)
})

export default db
