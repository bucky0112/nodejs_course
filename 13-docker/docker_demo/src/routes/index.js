import { Router } from 'express'
import usersRouter from './users.js'
import notesRouter from './notes.js'

const router = Router()

router.use('/users', usersRouter)
router.use('/notes', notesRouter)

export default router
