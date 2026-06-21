import { Router } from 'express'
import * as authController from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/requireAuth.js'

export const authRouter = Router()

authRouter.post('/register', authController.register)
authRouter.post('/login', authController.login)
authRouter.post('/logout', authController.logout)
authRouter.get('/me', requireAuth, authController.me)
