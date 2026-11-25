import { Router } from 'express'
import { todosRouter } from './todos.routes.js'

export const routes = Router()
routes.use('/todos', todosRouter)
