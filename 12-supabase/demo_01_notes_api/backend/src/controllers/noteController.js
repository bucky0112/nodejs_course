import { noteService } from '../services/noteService.js'

export const noteController = {
  async getAll(req, res, next) {
    try {
      const { userId } = req.query

      let notes
      if (userId) {
        notes = await noteService.findByUserId(Number(userId))
      } else {
        notes = await noteService.findAll()
      }

      res.json({ success: true, data: notes })
    } catch (error) {
      next(error)
    }
  },

  async getById(req, res, next) {
    try {
      const note = await noteService.findById(Number(req.params.id))
      if (!note) {
        return res.status(404).json({ success: false, error: 'Note not found' })
      }
      res.json({ success: true, data: note })
    } catch (error) {
      next(error)
    }
  },

  async create(req, res, next) {
    try {
      const { title, content, userId } = req.body
      if (!title) {
        return res.status(400).json({ success: false, error: 'Title is required' })
      }
      const note = await noteService.create({ title, content, userId })
      res.status(201).json({ success: true, data: note })
    } catch (error) {
      // 處理 foreign key 錯誤
      if (error.code === '23503') {
        return res.status(400).json({ success: false, error: 'User not found' })
      }
      next(error)
    }
  },

  async update(req, res, next) {
    try {
      const note = await noteService.update(Number(req.params.id), req.body)
      if (!note) {
        return res.status(404).json({ success: false, error: 'Note not found' })
      }
      res.json({ success: true, data: note })
    } catch (error) {
      next(error)
    }
  },

  async delete(req, res, next) {
    try {
      const note = await noteService.delete(Number(req.params.id))
      if (!note) {
        return res.status(404).json({ success: false, error: 'Note not found' })
      }
      res.json({ success: true, data: note })
    } catch (error) {
      next(error)
    }
  }
}
