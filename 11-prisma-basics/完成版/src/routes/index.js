import { Router } from 'express'
import { todosRouter } from './todos.routes.js'
import { notesRouter } from './notes.routes.js'

export const routes = Router()
routes.use('/todos', todosRouter)
routes.use('/notes', notesRouter)
