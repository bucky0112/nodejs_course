# 概念卡：用 multer 處理檔案上傳

> 一句話：一般 JSON 用 `express.json()` 解析，但檔案是用 `multipart/form-data` 送的，要用 **multer** 來解析，解析後檔案會放在 `req.file`。

---

## 一、為什麼不能用 express.json()

上傳檔案時，瀏覽器用 `multipart/form-data` 編碼（檔案的二進位 + 其他欄位混在一起）。`express.json()` 看不懂這種格式。multer 專門解析它，把檔案放進 `req.file`（單檔）或 `req.files`（多檔），其他文字欄位放 `req.body`。

---

## 二、memoryStorage vs diskStorage

multer 有兩種儲存方式：

| | memoryStorage | diskStorage |
|---|---|---|
| 檔案放哪 | 記憶體 buffer（`req.file.buffer`） | 寫到本機暫存檔 |
| 適合 | 直接轉手上傳到 S3 等雲端 | 需要在本機處理檔案 |

本課程用 **memoryStorage**，因為我們要把檔案**直接串流上 S3**，不需要在自己機器留暫存檔（省去之後還要清理暫存、上傳失敗會殘留的麻煩）。

```js
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('只接受圖片檔'))
    cb(null, true)
  },
})

app.post('/me/avatar', upload.single('avatar'), handler) // 'avatar' 是 form 欄位名
```

---

## 三、兩道防線：型別與大小

- `fileFilter`：擋掉非圖片。
- `limits.fileSize`：擋掉太大的檔，超過時 multer 丟 `MulterError`（code `LIMIT_FILE_SIZE`），要在錯誤處理裡接住回 413。

```js
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: '檔案太大' })
  }
  // ...
})
```

---

## 四、重要的安全提醒

1. **`mimetype` 可被偽造**：它來自瀏覽器送的 Content-Type，攻擊者可以把任意檔案標成 `image/png`。`fileFilter` 只是第一道過濾；高安全需求要再驗證檔案實際內容（magic bytes）。
2. **別信任 `originalname`**：使用者的原始檔名可能含 `../` 路徑或特殊字元。本課程**改用隨機檔名**（`crypto.randomUUID()`），不直接拿原檔名當 S3 key。

---

## 延伸
- multer 請用 **2.x**（1.x 已停滯多年）。
- 上傳到哪、怎麼安全地存取 → [概念卡：S3 與 presigned URL](./s3-presigned-url.md)
