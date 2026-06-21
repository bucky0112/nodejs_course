import multer from 'multer'

// ---------- multer：檔案上傳設定 ----------
// memoryStorage：檔案放在記憶體 buffer，直接串流上 S3，不落地暫存檔。
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    // 注意：mimetype 是瀏覽器送的、可被偽造，這只是第一道過濾。
    // 高安全需求應再驗證檔案實際內容（magic bytes）。
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('只接受圖片檔'))
    }
    cb(null, true)
  },
})
