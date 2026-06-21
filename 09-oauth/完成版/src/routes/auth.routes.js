import { Router } from 'express'
import * as authController from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/requireAuth.js'

export const authRouter = Router()

// JWT 無狀態：register/login 成功直接回 token，沒有伺服器端 logout 路由。
authRouter.post('/register', authController.register)
authRouter.post('/login', authController.login)

// Google OAuth（Authorization Code Flow，手刻）
authRouter.get('/google', authController.googleStart)
authRouter.get('/google/callback', authController.googleCallback)

authRouter.get('/me', requireAuth, authController.me)
