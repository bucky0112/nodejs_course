import { Router } from 'express'
import * as todosController from '../controllers/todos.controller.js'
import { requireAuth } from '../middleware/requireAuth.js'

export const todosRouter = Router()

// todos 全部需 token，且只看得到自己的
todosRouter.use(requireAuth)

todosRouter.get('/', todosController.list)
todosRouter.get('/:id', todosController.get)
todosRouter.post('/', todosController.create)
todosRouter.patch('/:id', todosController.update)
todosRouter.delete('/:id', todosController.remove)
todosRouter.post('/:id/tags', todosController.addTag)
todosRouter.delete('/:id/tags/:tagId', todosController.removeTag)
