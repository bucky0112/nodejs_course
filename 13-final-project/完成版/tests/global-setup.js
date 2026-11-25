// 跑測試之前，把 prisma/migrations 套用到測試資料庫，讓它的資料表結構跟開發環境一樣。
import { execSync } from 'node:child_process'
import './load-test-env.js'

export default function setup() {
  execSync('npx prisma migrate deploy', { stdio: 'inherit', env: process.env })
}
