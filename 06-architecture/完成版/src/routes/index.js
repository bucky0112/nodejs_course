import { Router } from 'express'
import { todosRouter } from './todos.routes.js'
import { listsRouter } from './lists.routes.js'
import { tagsRouter } from './tags.routes.js'

export const routes = Router()
routes.use('/todos', todosRouter)
routes.use('/lists', listsRouter)
routes.use('/tags', tagsRouter)
