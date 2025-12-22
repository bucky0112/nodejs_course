import express from 'express'
import { googleAuth, googleAuthCallback } from '../controllers/useController.js'

const router = express.Router()

// /auth/google => 導向 Google 登入頁
router.get('/google', googleAuth)

// /auth/google/callback => Google 登入後導回來
router.get('/google/callback', googleAuthCallback)

export default router