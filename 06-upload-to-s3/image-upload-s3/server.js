// ============================================
// 套件引入說明
// ============================================

// Express - Node.js 的 Web 框架，用來建立 HTTP 伺服器和處理路由
import express from 'express'

// Multer - 專門處理 multipart/form-data 格式的中間件
// 這是 HTML 表單上傳檔案時使用的編碼格式
// <form enctype="multipart/form-data">
import multer from 'multer'

// dotenv - 自動讀取 .env 檔案，將環境變數載入 process.env
// 用 /config 後綴可以自動執行，不需要額外呼叫 config()
import 'dotenv/config'

// AWS SDK v3 - 模組化設計，只引入需要的功能
// S3Client: S3 服務的客戶端，負責與 AWS S3 通訊
// PutObjectCommand: 上傳物件的指令
// GetObjectCommand: 取得物件的指令（用於產生 Presigned URL）
import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'

// Node.js 內建的檔案系統模組
// node: 前綴是 Node.js 16+ 的新寫法，明確表示這是內建模組
import fs from 'node:fs'

// Presigned URL 產生器
// 可以為 S3 物件產生帶有簽名的臨時存取網址
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const app = express()
const port = 3000

// ============================================
// Multer 設定
// ============================================
// multer 是處理 multipart/form-data 的中間件，主要用於檔案上傳
// dest: "uploads/" 表示檔案會先暫存到本地的 uploads/ 資料夾
// 注意：這是「兩段式上傳」- 先存本地，再上傳到 S3
const upload = multer({ dest: "uploads/" })

// ============================================
// AWS S3 Client 設定
// ============================================
// 使用 AWS SDK v3 建立 S3 客戶端
// 需要在 .env 檔案中設定以下環境變數：
// - AWS_REGION: AWS 區域（例如：ap-northeast-1）
// - AWS_ACCESS_KEY_ID: IAM 使用者的 Access Key
// - AWS_SECRET_ACCESS_KEY: IAM 使用者的 Secret Key
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})

// ============================================
// 檔案上傳 API
// ============================================
// POST /upload
// Content-Type: multipart/form-data
// Body: image (檔案欄位名稱必須是 "image")
app.post("/upload", upload.single("image"), async (req, res) => {
  // req.file 包含上傳檔案的資訊：
  // - fieldname: 表單欄位名稱 ("image")
  // - originalname: 原始檔案名稱
  // - mimetype: 檔案類型 (例如 "image/png")
  // - path: 暫存檔案的本地路徑
  // - size: 檔案大小（bytes）
  const file = req.file

  // 檢查是否有上傳檔案
  if (!file) {
    return res.status(400).send("沒有上傳檔案")
  }

  // 產生唯一的檔案名稱，避免檔名衝突
  // 格式：時間戳記-原始檔名（例如：1704067200000-photo.jpg）
  const fileKey = `${Date.now()}-${file.originalname}`

  // 建立檔案讀取串流，用於上傳到 S3
  const fileStream = fs.createReadStream(file.path)

  // S3 上傳參數設定
  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME,  // S3 儲存桶名稱
    Key: fileKey,                         // 檔案在 S3 中的路徑/名稱
    Body: fileStream,                     // 檔案內容（串流）
    ContentType: file.mimetype            // 設定正確的 MIME 類型，確保瀏覽器能正確顯示
  }

  try {
    // ============================================
    // 步驟 1: 上傳檔案到 S3
    // ============================================
    // PutObjectCommand 是 AWS SDK v3 的上傳指令
    await s3.send(new PutObjectCommand(uploadParams))

    // ============================================
    // 步驟 2: 刪除本地暫存檔案
    // ============================================
    // 上傳成功後，清理本地暫存檔案以節省空間
    fs.unlinkSync(file.path)

    // ============================================
    // 步驟 3: 產生 Presigned URL（預簽名網址）
    // ============================================
    // 什麼是 Presigned URL？
    // - 一個帶有簽名的臨時網址，允許沒有 AWS 憑證的人存取私有物件
    // - 適用於「私有」的 S3 Bucket（不需要設定公開存取）
    // - 可以設定過期時間，過期後網址就失效
    //
    // 為什麼要用 Presigned URL？
    // - 安全性：Bucket 保持私有，不會被任意存取
    // - 控制性：可以控制每個網址的有效期限
    // - 彈性：可以針對不同使用者產生不同的存取網址
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey
    })

    // expiresIn: 3600 表示網址有效期為 3600 秒（1 小時）
    // 過期後需要重新產生新的 Presigned URL
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 })

    // 回傳上傳成功訊息和可存取的網址
    res.json({
      message: "上傳成功",
      imageUrl: signedUrl
    })
  } catch (err) {
    console.error("S3 Upload Error:", err)
    res.status(500).send("上傳失敗")
  }
})

// ============================================
// 列出所有檔案 API
// ============================================
// GET /files
// 可選參數：?expires=秒數（預設 3600 秒）
app.get("/files", async (req, res) => {
  try {
    // 從 query string 取得過期時間，預設 1 小時
    // 例如：GET /files?expires=7200（2 小時）
    const expiresIn = parseInt(req.query.expires) || 3600

    // 列出 bucket 中所有物件
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME
    })

    const data = await s3.send(listCommand)

    // 如果 bucket 是空的，回傳空陣列
    if (!data.Contents || data.Contents.length === 0) {
      return res.json([])
    }

    // ============================================
    // 為每個檔案產生 Presigned URL
    // ============================================
    // 注意：getSignedUrl 是 async 函數
    // 使用 Promise.all 來並行處理，提升效能
    const files = await Promise.all(
      data.Contents.map(async (item) => {
        // 為每個物件建立 GetObjectCommand
        const getCommand = new GetObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: item.Key
        })

        // 產生 Presigned URL
        const signedUrl = await getSignedUrl(s3, getCommand, { expiresIn })

        return {
          key: item.Key,                    // 檔案名稱（S3 Key）
          size: item.Size,                  // 檔案大小（bytes）
          lastModified: item.LastModified,  // 最後修改時間
          url: signedUrl                    // Presigned URL（有時效性）
        }
      })
    )

    res.json({
      files,
      expiresIn,  // 告訴前端這些 URL 的有效期限
      message: `URL 將在 ${expiresIn} 秒後過期`
    })
  } catch (err) {
    console.error("List Files Error:", err)
    res.status(500).send("無法列出檔案")
  }
})


app.listen(port, () => {
  console.log(`🚀 Server 執行中 http://localhost:${port}`)
})

// ============================================
// 💡 S3 Bucket 公開 vs 私有 說明
// ============================================
//
// 【情境 1】Bucket 設為「公開」(Public)
// ─────────────────────────────────────
// 優點：
//   - 可以直接用固定網址存取：
//     https://{bucket-name}.s3.{region}.amazonaws.com/{key}
//     例如：https://my-bucket.s3.ap-northeast-1.amazonaws.com/photo.jpg
//   - 不需要產生 Presigned URL
//   - 網址永久有效，不會過期
//
// 缺點：
//   ⚠️ 任何人都可以存取你的檔案！
//   ⚠️ 可能產生意外的流量費用（別人盜連你的圖片）
//   ⚠️ 無法控制誰可以存取
//   ⚠️ AWS 會在 Console 上顯示安全警告
//
// 適用場景：
//   - 完全公開的靜態資源（如：公開的網站圖片）
//   - CDN 的 Origin（會搭配 CloudFront 使用）
//
//
// 【情境 2】Bucket 設為「私有」(Private) - 本範例使用的方式
// ─────────────────────────────────────────────────────────
// 優點：
//   ✅ 預設所有檔案都是私有的，未經授權無法存取
//   ✅ 透過 Presigned URL 控制存取權限和時效
//   ✅ 可以設定不同的過期時間（1 小時、1 天等）
//   ✅ 更安全，符合最佳實踐
//
// 缺點：
//   - 需要在後端產生 Presigned URL
//   - URL 會過期，需要處理過期後的更新邏輯
//   - URL 很長（包含簽名參數）
//
// 適用場景：
//   - 使用者上傳的私人檔案
//   - 需要控制存取權限的資源
//   - 付費內容或會員專屬資源
//
//
// 【如果 Bucket 沒設公開，又沒用 Presigned URL 會怎樣？】
// ─────────────────────────────────────────────────────
// 直接用 S3 URL 存取會得到以下錯誤：
//
// HTTP 403 Forbidden
// <Error>
//   <Code>AccessDenied</Code>
//   <Message>Access Denied</Message>
// </Error>
//
// 這是因為 S3 預設會拒絕所有未經授權的請求。
// 只有以下方式可以存取私有物件：
//   1. 使用 AWS 憑證（Access Key + Secret Key）
//   2. 使用 Presigned URL（帶有簽名的臨時網址）
//   3. 使用 IAM Role（例如 EC2 Instance Role）
//   4. 使用 S3 Access Point
//
//
// 【Presigned URL 的運作原理】
// ─────────────────────────────
// Presigned URL 包含以下參數：
//   - X-Amz-Algorithm: 簽名演算法
//   - X-Amz-Credential: 使用的憑證資訊
//   - X-Amz-Date: 簽名時間
//   - X-Amz-Expires: 有效期限（秒）
//   - X-Amz-SignedHeaders: 被簽名的 Header
//   - X-Amz-Signature: 簽名值
//
// 範例 URL:
// https://bucket.s3.region.amazonaws.com/file.jpg
//   ?X-Amz-Algorithm=AWS4-HMAC-SHA256
//   &X-Amz-Credential=AKIA.../20240101/region/s3/aws4_request
//   &X-Amz-Date=20240101T000000Z
//   &X-Amz-Expires=3600
//   &X-Amz-SignedHeaders=host
//   &X-Amz-Signature=abc123...
//
// AWS 收到請求時會：
//   1. 驗證簽名是否正確
//   2. 檢查是否在有效期限內
//   3. 確認憑證是否有權限存取該物件
//   通過所有檢查後才會回傳檔案內容
