import multer from 'multer'

// 沒有任何路由命中 → 404
export function notFound(req, res) {
  res.status(404).json({ error: `找不到路徑 ${req.method} ${req.originalUrl}` })
}

// 全域錯誤出口：service 拋的 HttpError 帶 status；其餘視為 500。
// 必須是 4 個參數，express 才認得這是錯誤處理 middleware。
export function errorHandler(err, req, res, next) {
  // multer 的檔案大小超限
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: '檔案太大（上限 2MB）' })
    }
    return res.status(400).json({ error: err.message })
  }
  // fileFilter 丟出的「只接受圖片檔」等錯誤
  if (err.message === '只接受圖片檔') {
    return res.status(400).json({ error: err.message })
  }
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || '伺服器發生錯誤' })
}
