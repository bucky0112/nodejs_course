import { S3Client } from '@aws-sdk/client-s3'

// AWS SDK v3 的 S3 client（不是已過時的 v2 aws-sdk）
export const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

export const BUCKET = process.env.S3_BUCKET
