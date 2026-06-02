import db from '../configs/db.js'
import { eq, and, count } from 'drizzle-orm'
import { likesTable } from '../models/schema.js'

const createLike = async (req, res) => {
  const { id } = req.params
  const { userId } = req.body
  const like = await db.insert(likesTable).values({ userId, postId: id })
  res.status(201).json(like)
}

const deleteLike = async (req, res) => {
  const { id } = req.params
  const { userId } = req.body
  // likes 主鍵是 (user_id, post_id)，刪讚必須同時比對兩欄，
  // 否則只用 userId 會把該使用者對「所有貼文」的讚全刪掉
  const like = await db
    .delete(likesTable)
    .where(and(eq(likesTable.userId, userId), eq(likesTable.postId, id)))
  res.status(200).json(like)
}

const getLikes = async (req, res) => {
  const { id } = req.params
  // const likes = await db.select().from(likesTable).where(eq(likesTable.postId, id))
  // 使用 count 計算總數
  const likes = await db.select({ count: count() }).from(likesTable).where(eq(likesTable.postId, id))
  // SELECT COUNT(*) FROM likes WHERE post_id = id;
  res.status(200).json(likes)
}

export { createLike, deleteLike, getLikes }
