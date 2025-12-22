import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import 'dotenv/config'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

const db = drizzle(pool)

export default db
