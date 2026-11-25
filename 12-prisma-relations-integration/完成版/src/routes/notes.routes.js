// route：只宣告「哪個方法 + 路徑」對到哪個 controller，不寫任何邏輯。
import { Router } from 'express'
import * as notesController from '../controllers/notes.controller.js'

export const notesRouter = Router()

notesRouter.get('/', notesController.list)
notesRouter.get('/:id', notesController.get)
notesRouter.post('/', notesController.create)
notesRouter.patch('/:id', notesController.update)
notesRouter.delete('/:id', notesController.remove)
