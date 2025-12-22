import express from 'express'
import { useRegister, useLogin, useGetProfile } from '../controller/useAuth.js'
import { validateRegister, authenticateToken } from '../middleware/validateRegister.js'

const router = express.Router()

// 註冊
router.post('/register', validateRegister, useRegister)

// 登入
router.post('/login', useLogin)

// 取得個人資料
router.get('/profile', authenticateToken, useGetProfile)

export default router
