# 概念卡：S3 與 Presigned URL

> 一句話：S3 是雲端檔案倉庫；把 bucket 設成**私有**、需要給人看檔案時才產生一個**短期有效的 presigned URL**，比把整個 bucket 公開安全得多。

---

## 一、S3 基本概念

- **Bucket**：一個檔案容器（取個全域唯一的名字）。
- **Object**：放進去的檔案，用 **key**（像路徑的字串，例如 `avatars/3/abc.png`）識別。
- 上傳用 `PutObjectCommand`、下載用 `GetObjectCommand`（AWS SDK **v3**）。

```js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
const s3 = new S3Client({ region, credentials })
await s3.send(new PutObjectCommand({ Bucket, Key, Body: buffer, ContentType }))
```

---

## 二、公開 bucket 的問題

最簡單的做法是把 bucket 設公開、用 `https://bucket.s3.region.amazonaws.com/key` 直連。但這代表**任何知道 key 的人都能存取**，也容易整個 bucket 被列舉。對使用者頭像這種「屬於某人」的檔案不理想。

---

## 三、Presigned URL：私有 bucket 的正解

把 bucket 設**私有**，要給人看某個檔案時，後端用密鑰**臨時簽**一個帶簽章、有期限的網址：

```js
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GetObjectCommand } from '@aws-sdk/client-s3'

const url = await getSignedUrl(
  s3,
  new GetObjectCommand({ Bucket, Key }),
  { expiresIn: 300 }, // 5 分鐘後失效
)
```

- ✅ bucket 維持私有，沒有 presigned URL 的人存取不了。
- ✅ URL 有期限，外洩了也很快失效。
- 用途：前端拿這個 URL 當 `<img src>`，過期再跟後端要新的。

---

## 四、IAM 最小權限（重要）

給程式用的 AWS 憑證，**不要**用 `AmazonS3FullAccess`（能動所有 bucket）。應該只給「這個 bucket、這些動作」的最小權限：

```json
{
  "Effect": "Allow",
  "Action": ["s3:PutObject", "s3:GetObject"],
  "Resource": "arn:aws:s3:::你的-bucket/*"
}
```

原則：權限越小，憑證萬一外洩的損害越小。

---

## 延伸
- 上傳前怎麼解析與驗證檔案 → [概念卡：用 multer 處理檔案上傳](./檔案上傳-multer.md)
- 刪除檔案用 `DeleteObjectCommand`；換頭像時記得把舊的 object 也刪掉，避免堆垃圾。
