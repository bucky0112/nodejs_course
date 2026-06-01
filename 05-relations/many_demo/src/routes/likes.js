import express from 'express'
import { createLike, deleteLike, getLikes } from '../controllers/useLikes.js'

const router = express.Router()

// POST   /posts/:id/like       // 按讚
// DELETE /posts/:id/unlike     // 取消讚
// GET    /posts/:id/likes      // 查看按讚的人或總數

router.post("/:id/like", createLike)
router.delete("/:id/unlike", deleteLike)
router.get("/:id/likes", getLikes)

export default router