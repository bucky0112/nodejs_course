import { Router } from 'express'
import { userController } from '../controllers/userController.js'

const router = Router()

// 注意：/stats 要放在 /:id 之前，否則 stats 會被當成 id！
router.get('/', userController.getAll)
router.get('/stats', userController.getStats)
router.get('/:id', userController.getById)
router.get('/:id/notes', userController.getWithNotes)
router.post('/', userController.create)
router.put('/:id', userController.update)
router.delete('/:id', userController.delete)

export default router
