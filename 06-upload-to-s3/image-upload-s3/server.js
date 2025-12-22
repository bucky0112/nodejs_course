import express from 'express'
import multer from 'multer'
import 'dotenv/config'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import fs from 'node:fs'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const app = express()
const port = 3000

// multer 主要先將檔案儲存在本地端，再上傳到 S3
const upload = multer({ dest: "uploads/" })

// S3 Client 設定
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})

app.post("/upload", upload.single("image"), async (req, res) => {
  const file = req.file

  if (!file) {
    return res.status(400).send("沒有上傳檔案")
  }

  const fileKey = `${Date.now()}-${file.originalname}`
  const fileStream = fs.createReadStream(file.path)
  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileKey,
    Body: fileStream,
    ContentType: file.mimetype
  }

  try {
    await s3.send(new PutObjectCommand(uploadParams))
    fs.unlinkSync(file.path)

    // 生成預簽名 URL
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey
    })

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 })

    res.json({
      message: "上傳成功",
      imageUrl: signedUrl
    })
  } catch (err) {
    console.error("S3 Upload Error:", err)
    res.status(500).send("上傳失敗")
  }
})

app.listen(port, () => {
  console.log(`🚀 Server 執行中 http://localhost:${port}`)
})
