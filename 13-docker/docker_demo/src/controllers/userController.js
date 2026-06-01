import { userService } from '../services/userService.js'

export const userController = {
  // GET /api/users
  async getAll(req, res, next) {
    try {
      const users = await userService.findAll()
      res.json({ success: true, data: users })
    } catch (error) {
      next(error)
    }
  },

  // GET /api/users/stats
  async getStats(req, res, next) {
    try {
      const stats = await userService.findAllWithNoteCount()
      res.json({ success: true, data: stats })
    } catch (error) {
      next(error)
    }
  },

  // GET /api/users/:id
  async getById(req, res, next) {
    try {
      const id = parseInt(req.params.id)
      const user = await userService.findById(id)

      if (!user) {
        return res.status(404).json({
          success: false,
          error: '找不到使用者'
        })
      }

      res.json({ success: true, data: user })
    } catch (error) {
      next(error)
    }
  },

  // GET /api/users/:id/notes
  async getWithNotes(req, res, next) {
    try {
      const id = parseInt(req.params.id)
      const user = await userService.findByIdWithNotes(id)

      if (!user) {
        return res.status(404).json({
          success: false,
          error: '找不到使用者'
        })
      }

      res.json({ success: true, data: user })
    } catch (error) {
      next(error)
    }
  },

  // POST /api/users
  async create(req, res, next) {
    try {
      const { name, email } = req.body

      if (!name || !email) {
        return res.status(400).json({
          success: false,
          error: 'name 和 email 為必填'
        })
      }

      const newUser = await userService.create({ name, email })
      res.status(201).json({ success: true, data: newUser })
    } catch (error) {
      // 處理 email 重複錯誤
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          error: 'Email 已被使用'
        })
      }
      next(error)
    }
  },

  // PUT /api/users/:id
  async update(req, res, next) {
    try {
      const id = parseInt(req.params.id)
      const { name, email } = req.body

      // 建立更新物件
      const updateData = {}
      if (name) updateData.name = name
      if (email) updateData.email = email

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: '沒有要更新的欄位'
        })
      }

      const updatedUser = await userService.update(id, updateData)

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          error: '找不到使用者'
        })
      }

      res.json({ success: true, data: updatedUser })
    } catch (error) {
      // 處理 email 重複錯誤
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          error: 'Email 已被使用'
        })
      }
      next(error)
    }
  },

  // DELETE /api/users/:id
  async delete(req, res, next) {
    try {
      const id = parseInt(req.params.id)
      const deletedUser = await userService.delete(id)

      if (!deletedUser) {
        return res.status(404).json({
          success: false,
          error: '找不到使用者'
        })
      }

      res.json({
        success: true,
        message: '使用者已刪除',
        data: deletedUser
      })
    } catch (error) {
      next(error)
    }
  }
}
