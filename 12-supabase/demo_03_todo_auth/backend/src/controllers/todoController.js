import { todoService } from '../services/todoService.js'

export const todoController = {
  async getAll(req, res, next) {
    try {
      const todos = await todoService.findByUserId(req.user.id)
      res.json({ success: true, data: todos })
    } catch (error) {
      next(error)
    }
  },

  async getById(req, res, next) {
    try {
      const todo = await todoService.findById(Number(req.params.id), req.user.id)
      if (!todo) {
        return res.status(404).json({ success: false, error: 'Todo not found' })
      }
      res.json({ success: true, data: todo })
    } catch (error) {
      next(error)
    }
  },

  async create(req, res, next) {
    try {
      const { title } = req.body

      if (!title) {
        return res.status(400).json({ success: false, error: 'Title is required' })
      }

      const todo = await todoService.create({
        title,
        user_id: req.user.id,
        completed: false
      })

      res.status(201).json({ success: true, data: todo })
    } catch (error) {
      next(error)
    }
  },

  async update(req, res, next) {
    try {
      const { title, completed } = req.body
      const updateData = {}

      if (title !== undefined) updateData.title = title
      if (completed !== undefined) updateData.completed = completed

      const todo = await todoService.update(
        Number(req.params.id),
        req.user.id,
        updateData
      )

      if (!todo) {
        return res.status(404).json({ success: false, error: 'Todo not found' })
      }

      res.json({ success: true, data: todo })
    } catch (error) {
      next(error)
    }
  },

  async delete(req, res, next) {
    try {
      const todo = await todoService.delete(Number(req.params.id), req.user.id)

      if (!todo) {
        return res.status(404).json({ success: false, error: 'Todo not found' })
      }

      res.json({ success: true, data: todo })
    } catch (error) {
      next(error)
    }
  }
}
