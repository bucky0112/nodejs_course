import { Router } from 'express'
import * as todosController from '../controllers/todos.controller.js'

export const todosRouter = Router()

todosRouter.get('/', todosController.list)
todosRouter.get('/:id', todosController.get)
todosRouter.post('/', todosController.create)
todosRouter.patch('/:id', todosController.update)
todosRouter.delete('/:id', todosController.remove)
