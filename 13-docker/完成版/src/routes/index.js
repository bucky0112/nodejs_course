import { Router } from 'express'
import { todosRouter } from './todos.routes.js'

export const routes = Router()

// 健康檢查：Compose 的 depends_on / 部署平台會打這支確認 app 活著
routes.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

routes.use('/todos', todosRouter)
