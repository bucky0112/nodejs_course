import { messageService } from '../services/messageService.js'

export const messageController = {
  async getByRoom(req, res, next) {
    try {
      const roomId = Number(req.params.roomId)
      const messages = await messageService.findByRoomId(roomId)
      res.json({ success: true, data: messages })
    } catch (error) {
      next(error)
    }
  },

  async create(req, res, next) {
    try {
      const { room_id, username, content } = req.body

      if (!room_id || !username || !content) {
        return res.status(400).json({
          success: false,
          error: 'room_id, username, and content are required'
        })
      }

      const message = await messageService.create({ room_id, username, content })
      res.status(201).json({ success: true, data: message })
    } catch (error) {
      next(error)
    }
  },

  async delete(req, res, next) {
    try {
      const message = await messageService.delete(Number(req.params.id))
      res.json({ success: true, data: message })
    } catch (error) {
      next(error)
    }
  }
}
