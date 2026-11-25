// 整個 app 共用一個 PrismaClient。
// Prisma 7 透過「driver adapter」連資料庫，PostgreSQL 用 @prisma/adapter-pg。
import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.ts'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })

export const prisma = new PrismaClient({ adapter })
