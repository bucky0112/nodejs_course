const express = require('express')
const router = express.Router()
const auth = require("../middlewares/auth.js")

router.get('/products', auth, (req, res) => {
  res.json({ message: 'products' })
})

module.exports = router
