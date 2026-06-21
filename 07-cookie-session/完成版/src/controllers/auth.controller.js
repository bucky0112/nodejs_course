// controller 負責 session 寫入/銷毀；業務驗證交給 service。
import * as authService from '../services/auth.service.js'

export async function register(req, res) {
  const user = await authService.register(req.body)
  req.session.userId = user.id // 註冊完直接登入
  res.status(201).json(user)
}

export async function login(req, res) {
  const user = await authService.login(req.body)
  req.session.userId = user.id
  res.json(user)
}

export function logout(req, res) {
  // 示範簡化：忽略 destroy 的 err（無論成敗都清 cookie 並回 204）；
  // 正式環境應處理 err（例如 log 或回傳錯誤），避免靜默吞掉 session 銷毀失敗。
  req.session.destroy(() => {
    res.clearCookie('connect.sid')
    res.status(204).send()
  })
}

export async function me(req, res) {
  const user = await authService.getUser(req.session.userId)
  res.json(user)
}
