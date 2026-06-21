import { Router } from 'express'
import * as tagsController from '../controllers/tags.controller.js'
import { requireAuth } from '../middleware/requireAuth.js'

export const tagsRouter = Router()
tagsRouter.use(requireAuth)
tagsRouter.get('/', tagsController.list)
tagsRouter.post('/', tagsController.create)
