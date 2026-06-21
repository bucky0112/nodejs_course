import { eq } from 'drizzle-orm'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { HttpError } from '../lib/httpError.js'

// 純業務：不碰 req/res（簽 token 屬無狀態認證，仍歸 service；session 才是 HTTP 狀態）。

// 簽一個 7 天有效的 JWT，sub 放使用者 id
export function signToken(userId) {
  return jwt.sign({ sub: String(userId) }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '7d',
  })
}

export async function register({ username, password }) {
  if (typeof username !== 'string' || username.trim().length < 3) {
    throw new HttpError(400, 'username 至少 3 個字')
  }
  if (typeof password !== 'string' || password.length < 6) {
    throw new HttpError(400, 'password 至少 6 個字')
  }

  const existing = await db.query.users.findFirst({ where: eq(users.username, username) })
  if (existing) {
    throw new HttpError(409, '這個 username 已被註冊')
  }

  // 雜湊密碼後才存（10 是 cost factor）
  const passwordHash = await bcrypt.hash(password, 10)
  const [user] = await db
    .insert(users)
    .values({ username, passwordHash })
    .returning({ id: users.id, username: users.username })

  // 註冊完直接發 token（無狀態，伺服器不存任何登入狀態）
  return { token: signToken(user.id), user }
}

export async function login({ username, password }) {
  const user = await db.query.users.findFirst({ where: eq(users.username, username) })

  // 不論「帳號不存在」或「密碼錯」都回同樣的訊息，避免洩漏哪個帳號存在
  if (!user || !(await bcrypt.compare(password ?? '', user.passwordHash))) {
    throw new HttpError(401, '帳號或密碼錯誤')
  }

  return { token: signToken(user.id), user: { id: user.id, username: user.username } }
}

export async function getUser(userId) {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, username: true },
  })
}
