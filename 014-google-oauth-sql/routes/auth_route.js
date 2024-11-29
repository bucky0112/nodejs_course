const express = require('express')
const router = express.Router()
const { register, login, googleLogin } = require('../controllers/auth_controller')
const passport = require('passport')

// 註冊
router.post('/register', async (req, res) => {
  try {
    const { email, username, password } = req.body

    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: '記得填資料'
      })
    }

    const result = await register(email, username, password)
    res.json({ success: true, ...result })
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    })
  }
})

// 登入
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '請輸入帳號密碼'
      })
    }

    const result = await login(email, password)
    res.json({ success: true, ...result })
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    })
  }
})

// Google 登入
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['email', 'profile']
  })
)

// Google 登入 callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }), // 登入失敗導向 /login
  async (req, res) => {
    try {
      const result = await googleLogin(req.user)
      res.json({ success: true, ...result })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      })
    }
  }
)

module.exports = router
