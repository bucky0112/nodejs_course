// JWT 是無狀態的：controller 不再寫入/銷毀 session，直接把 service 簽好的 token 回給前端。
import crypto from 'node:crypto'
import * as authService from '../services/auth.service.js'

export async function register(req, res) {
  res.status(201).json(await authService.register(req.body))
}

export async function login(req, res) {
  res.json(await authService.login(req.body))
}

// 註：JWT 是無狀態的，伺服器沒存任何東西，所以「登出」其實是「前端把 token 丟掉」。
//     要做到伺服器端強制失效，需要額外機制（黑名單 / 短期 token + refresh），屬進階。
//     因此這裡沒有 logout。

export async function me(req, res) {
  const user = await authService.getUser(req.userId)
  res.json(user)
}

// ===================================================================
// Google OAuth（Authorization Code Flow，手刻）
// state 產生、cookie 設定、redirect、cookie 比對都屬 HTTP 行為，留在 controller。
// ===================================================================

// 第 1 步：把使用者導去 Google 授權頁
export async function googleStart(req, res) {
  // 產生隨機 state，存進短期 httpOnly cookie；回呼時用來比對，防 CSRF
  const state = crypto.randomBytes(16).toString('hex')
  res.cookie('oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 5 * 60 * 1000, // 5 分鐘
  })
  res.redirect(authService.buildGoogleAuthUrl(state))
}

// 第 2 步：Google 授權後導回這裡（帶 code 與 state）
export async function googleCallback(req, res) {
  const { code, state } = req.query

  // 防 CSRF：回傳的 state 必須跟我們先前存進 cookie 的一致
  if (!state || state !== req.cookies.oauth_state) {
    return res.status(403).json({ error: 'state 不符，拒絕（可能是 CSRF 攻擊）' })
  }
  res.clearCookie('oauth_state')

  if (!code) return res.status(400).json({ error: '缺少授權碼 code' })

  // 第 3 步：拿 code 去跟 Google 換 access token
  const accessToken = await authService.exchangeCodeForToken(code)
  // 第 4 步：用 access token 取得使用者基本資料
  const profile = await authService.fetchGoogleProfile(accessToken)
  // 第 5、6 步：找或建立使用者（用 googleId 當識別），並簽發我們自己的 JWT。
  // 重要：不要像某些教學那樣把 user 資料塞進 URL query string（會留在瀏覽器歷史/log）。
  // 正式環境會把 token 設成 httpOnly cookie，或交給前端安全保存；這裡為示範直接回 JSON。
  res.json(await authService.findOrCreateGoogleUser(profile))
}
