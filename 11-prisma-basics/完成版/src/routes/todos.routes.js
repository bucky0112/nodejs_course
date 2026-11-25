// route：只宣告「哪個方法 + 路徑」對到哪個 controller，不寫任何邏輯。
import { Router } from 'express'
import * as todosController from '../controllers/todos.controller.js'

export const todosRouter = Router()

todosRouter.get('/', todosController.list)
todosRouter.get('/:id', todosController.get)
todosRouter.post('/', todosController.create)
todosRouter.patch('/:id', todosController.update)
todosRouter.delete('/:id', todosController.remove)
