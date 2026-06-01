import { roomService } from '../services/roomService.js'

export const roomController = {
  async getAll(req, res, next) {
    try {
      const rooms = await roomService.findAll()
      res.json({ success: true, data: rooms })
    } catch (error) {
      next(error)
    }
  },

  async getById(req, res, next) {
    try {
      const room = await roomService.findById(Number(req.params.id))
      if (!room) {
        return res.status(404).json({ success: false, error: 'Room not found' })
      }
      res.json({ success: true, data: room })
    } catch (error) {
      next(error)
    }
  },

  async create(req, res, next) {
    try {
      const { name } = req.body
      if (!name) {
        return res.status(400).json({ success: false, error: 'Name is required' })
      }
      const room = await roomService.create({ name })
      res.status(201).json({ success: true, data: room })
    } catch (error) {
      next(error)
    }
  },

  async delete(req, res, next) {
    try {
      const room = await roomService.delete(Number(req.params.id))
      res.json({ success: true, data: room })
    } catch (error) {
      next(error)
    }
  }
}
