import { Router } from 'express'
import { authController } from '../controllers/authController.js'
import { todoController } from '../controllers/todoController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router()

// Auth routes (public)
router.post('/auth/register', authController.register)
router.post('/auth/login', authController.login)
router.post('/auth/logout', authController.logout)

// Protected routes (需要登入)
router.get('/auth/me', authMiddleware, authController.me)

// Todo routes (protected)
router.get('/todos', authMiddleware, todoController.getAll)
router.get('/todos/:id', authMiddleware, todoController.getById)
router.post('/todos', authMiddleware, todoController.create)
router.put('/todos/:id', authMiddleware, todoController.update)
router.delete('/todos/:id', authMiddleware, todoController.delete)

export default router
