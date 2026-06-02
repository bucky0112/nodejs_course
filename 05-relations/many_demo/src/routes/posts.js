import express from 'express'
import { createPost, getPostById, getPostsByUserId, updatePost, deletePost } from '../controllers/usePosts.js'

const router = express.Router()

// 這個 router 掛在 /posts 之下（見 index.js），下面路徑都會自動加上 /posts 前綴
// POST   /posts          // 發佈貼文
// GET    /posts/:id      // 查詢單篇貼文
// GET    /posts/user/:id // 查詢某使用者的所有貼文
// PUT    /posts/:id      // 更新貼文
// DELETE /posts/:id      // 刪除貼文

router.post("/", createPost)
router.get("/:id", getPostById)
router.get("/user/:id", getPostsByUserId)
router.put("/:id", updatePost)
router.delete("/:id", deletePost)

export default router
