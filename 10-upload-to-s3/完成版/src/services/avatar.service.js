import crypto from 'node:crypto'
import path from 'node:path'
import { eq } from 'drizzle-orm'
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { HttpError } from '../lib/httpError.js'
import { s3, BUCKET } from '../config/s3.js'

// 純業務：把檔案上 S3、把 key 存進 DB、產 presigned URL。不碰 req/res。

// 上傳 / 更新頭像
export async function uploadAvatar(userId, file) {
  // 用隨機檔名，不要信任使用者的原始檔名（可能含路徑或特殊字元）
  const ext = path.extname(file.originalname).toLowerCase() || '.img'
  const key = `avatars/${userId}/${crypto.randomUUID()}${ext}`

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  )

  await db.update(users).set({ avatarKey: key }).where(eq(users.id, userId))
  return { avatarKey: key }
}

// 取得頭像：產生短期 presigned URL（bucket 設為私有，不公開直連）
export async function getAvatarUrl(userId) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (!user?.avatarKey) {
    throw new HttpError(404, '還沒有上傳頭像')
  }
  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET, Key: user.avatarKey }),
    { expiresIn: 300 }, // 5 分鐘有效
  )
  return { url }
}
