// 頭像上傳：檢查 req.file（屬 HTTP 行為，留在 controller），其餘交給 service。
// userId 從 req.userId 取得（路由已掛 requireAuth）。
import * as avatarService from '../services/avatar.service.js'

export async function uploadAvatar(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: '請上傳一張圖片（form-data 欄位名為 avatar）' })
  }
  res.status(201).json(await avatarService.uploadAvatar(req.userId, req.file))
}

export async function getAvatar(req, res) {
  res.json(await avatarService.getAvatarUrl(req.userId))
}
