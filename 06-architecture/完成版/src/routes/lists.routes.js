import { Router } from 'express'
import * as listsController from '../controllers/lists.controller.js'

export const listsRouter = Router()
listsRouter.get('/', listsController.list)
listsRouter.post('/', listsController.create)
