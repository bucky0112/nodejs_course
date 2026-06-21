// JWT 是無狀態的：controller 不再寫入/銷毀 session，直接把 service 簽好的 token 回給前端。
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
