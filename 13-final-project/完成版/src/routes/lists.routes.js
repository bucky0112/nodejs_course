import { Router } from 'express'
import * as listsController from '../controllers/lists.controller.js'

export const listsRouter = Router()

listsRouter.get('/', listsController.list)
listsRouter.get('/:id', listsController.get)
listsRouter.post('/', listsController.create)
listsRouter.delete('/:id', listsController.remove)
