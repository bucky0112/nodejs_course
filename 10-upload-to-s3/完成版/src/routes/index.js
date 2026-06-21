import { Router } from 'express'
import { authRouter } from './auth.routes.js'
import { meRouter } from './me.routes.js'
import { todosRouter } from './todos.routes.js'
import { listsRouter } from './lists.routes.js'
import { tagsRouter } from './tags.routes.js'

export const routes = Router()
routes.use('/auth', authRouter)
routes.use('/me', meRouter)
routes.use('/todos', todosRouter)
routes.use('/lists', listsRouter)
routes.use('/tags', tagsRouter)
