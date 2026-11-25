// 沒有任何路由命中 → 404
export function notFound(req, res) {
  res.status(404).json({ error: `找不到路徑 ${req.method} ${req.originalUrl}` })
}

// 全域錯誤出口：所有錯誤最後都會來到這裡，統一回 { error: 訊息 }。
// 必須是 4 個參數，Express 才認得這是錯誤處理 middleware。
export function errorHandler(err, req, res, next) {
  // express.json() 解析失敗：前端送了壞掉的 JSON
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: '請求的 JSON 格式錯誤' })
  }

  const status = err.status || 500

  // 5xx 是伺服器自己的問題：完整錯誤印在 log，回應只給通用訊息，不洩漏內部細節
  if (status >= 500) {
    console.error(err)
    return res.status(status).json({ error: '伺服器發生錯誤' })
  }

  res.status(status).json({ error: err.message })
}
