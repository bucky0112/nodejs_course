import { userService } from '../services/userService.js'

export const userController = {
  async getAll(req, res, next) {
    try {
      const users = await userService.findAll()
      res.json({ success: true, data: users })
    } catch (error) {
      next(error)
    }
  },

  async getById(req, res, next) {
    try {
      const user = await userService.findById(Number(req.params.id))
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' })
      }
      res.json({ success: true, data: user })
    } catch (error) {
      next(error)
    }
  },

  async create(req, res, next) {
    try {
      const { name, email } = req.body
      if (!name || !email) {
        return res.status(400).json({ success: false, error: 'Name and email are required' })
      }
      const user = await userService.create({ name, email })
      res.status(201).json({ success: true, data: user })
    } catch (error) {
      // 處理 unique constraint 錯誤
      if (error.code === '23505') {
        return res.status(400).json({ success: false, error: 'Email already exists' })
      }
      next(error)
    }
  },

  async update(req, res, next) {
    try {
      const user = await userService.update(Number(req.params.id), req.body)
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' })
      }
      res.json({ success: true, data: user })
    } catch (error) {
      next(error)
    }
  },

  async delete(req, res, next) {
    try {
      const user = await userService.delete(Number(req.params.id))
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' })
      }
      res.json({ success: true, data: user })
    } catch (error) {
      next(error)
    }
  }
}
