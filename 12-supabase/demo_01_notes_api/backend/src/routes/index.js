import { Router } from 'express'
import { userController } from '../controllers/userController.js'
import { noteController } from '../controllers/noteController.js'

const router = Router()

// Users routes
router.get('/users', userController.getAll)
router.get('/users/:id', userController.getById)
router.post('/users', userController.create)
router.put('/users/:id', userController.update)
router.delete('/users/:id', userController.delete)

// Notes routes
router.get('/notes', noteController.getAll)
router.get('/notes/:id', noteController.getById)
router.post('/notes', noteController.create)
router.put('/notes/:id', noteController.update)
router.delete('/notes/:id', noteController.delete)

export default router
