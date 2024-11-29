const express = require('express')
const router = express.Router()
const passport = require('passport')

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['email', 'profile']
  })
)

router.get(
  '/google/callback', // 第一個參數
  passport.authenticate('google', { session: false }), // 第二個參數
  (req, res) => {
    // 第三個參數
    console.log('user', req.user)
    res.send({
      status: true,
      data: {
        id: req.user.id,
        name: req.user.displayName,
        fullName: req.user.name,
        email: req.user.emails,
        provider: req.user.provider
      }
    })
  }
)

module.exports = router
