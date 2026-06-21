import { Router } from 'express'
import * as listsController from '../controllers/lists.controller.js'
import { requireAuth } from '../middleware/requireAuth.js'

export const listsRouter = Router()
listsRouter.use(requireAuth)
listsRouter.get('/', listsController.list)
listsRouter.post('/', listsController.create)
