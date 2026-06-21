import { eq } from 'drizzle-orm'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { HttpError } from '../lib/httpError.js'

// 純業務：不碰 req/res（簽 token 屬無狀態認證，仍歸 service；session 才是 HTTP 狀態）。
// 注意：OAuth 流程中「產生 state、設 cookie、redirect、比對 cookie」屬 HTTP 行為，留在 controller。

// ===================================================================
// 帳號密碼認證（沿用 M5）
// ===================================================================

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

  // 用 Google 註冊的人沒有 passwordHash，bcrypt.compare 對 null 會失敗（正確地擋下）。
  // 不論「帳號不存在」或「密碼錯」都回同樣的訊息，避免洩漏哪個帳號存在。
  if (!user || !user.passwordHash || !(await bcrypt.compare(password ?? '', user.passwordHash))) {
    throw new HttpError(401, '帳號或密碼錯誤')
  }

  return { token: signToken(user.id), user: { id: user.id, username: user.username } }
}

export async function getUser(userId) {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
    // 這章新增 avatarKey：讓 /auth/me 也回頭像 key（前端可據此決定要不要去拿 presigned URL）
    columns: { id: true, username: true, avatarKey: true },
  })
}

// ===================================================================
// Google OAuth（Authorization Code Flow，手刻）
// ===================================================================

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'

// 用 state 組出 Google 授權頁網址（純字串組裝，不碰 req/res）
export function buildGoogleAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    state,
  })
  return `${GOOGLE_AUTH_URL}?${params}`
}

// 拿 code 去跟 Google 換 access token（後端對後端，client_secret 不外露）
export async function exchangeCodeForToken(code) {
  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  })
  if (!tokenRes.ok) throw new HttpError(401, '用 code 換 token 失敗')
  const { access_token } = await tokenRes.json()
  return access_token
}

// 用 access token 取得使用者基本資料
export async function fetchGoogleProfile(accessToken) {
  const infoRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!infoRes.ok) throw new HttpError(401, '取得使用者資訊失敗')
  return infoRes.json() // { id, email, name, picture, ... }
}

// 用 googleId 找或建立使用者，並簽發「我們自己的」JWT
export async function findOrCreateGoogleUser(profile) {
  let user = await db.query.users.findFirst({ where: eq(users.googleId, profile.id) })
  if (!user) {
    ;[user] = await db
      .insert(users)
      .values({ username: profile.email, googleId: profile.id })
      .returning({ id: users.id, username: users.username })
  }
  return { token: signToken(user.id), user }
}
