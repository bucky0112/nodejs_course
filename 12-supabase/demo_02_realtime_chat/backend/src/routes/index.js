import { Router } from 'express'
import { roomController } from '../controllers/roomController.js'
import { messageController } from '../controllers/messageController.js'

const router = Router()

// Rooms routes
router.get('/rooms', roomController.getAll)
router.get('/rooms/:id', roomController.getById)
router.post('/rooms', roomController.create)
router.delete('/rooms/:id', roomController.delete)

// Messages routes
router.get('/rooms/:roomId/messages', messageController.getByRoom)
router.post('/messages', messageController.create)
router.delete('/messages/:id', messageController.delete)

export default router
