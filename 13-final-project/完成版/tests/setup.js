// 每個測試檔執行前載入。
import './load-test-env.js'
import { beforeEach, afterAll } from 'vitest'
import { prisma } from '../src/db/prisma.js'

// 每個測試開始前清空所有資料表，id 也從 1 重新開始，讓每個測試都從乾淨的狀態出發。
// 這是測試專用的工具，所以用一行原生 SQL；app 本身的程式碼不寫原生 SQL。
beforeEach(async () => {
  await prisma.$executeRawUnsafe('TRUNCATE todo_tags, todos, lists, tags RESTART IDENTITY CASCADE')
})

afterAll(async () => {
  await prisma.$disconnect()
})
