import { Router } from 'express'
import * as tagsController from '../controllers/tags.controller.js'

export const tagsRouter = Router()

tagsRouter.get('/', tagsController.list)
tagsRouter.post('/', tagsController.create)
