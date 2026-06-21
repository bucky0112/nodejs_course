import { Router } from 'express'
import * as meController from '../controllers/me.controller.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { upload } from '../middleware/upload.js'

export const meRouter = Router()

// 上傳 / 更新頭像：先驗證登入，再讓 multer 收 form-data 的 avatar 欄位
meRouter.post('/avatar', requireAuth, upload.single('avatar'), meController.uploadAvatar)

// 取得頭像：產生短期 presigned URL
meRouter.get('/avatar', requireAuth, meController.getAvatar)
