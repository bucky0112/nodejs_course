const express = require('express')
const router = express.Router()

router.post('/users', async (req, res) => {
  try {
    const User = require('../models/User')
    const result = await User.create(req.body)
    res.status(201).json({
      success: true,
      data: result
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      data: err.message
    })
  }
})

router.get('/users', async (req, res) => {
  try {
    const User = require('../models/User')
    const result = await User.find()
    res.status(200).json({
      success: true,
      data: result
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      data: err.message
    })
  }
})

module.exports = router
