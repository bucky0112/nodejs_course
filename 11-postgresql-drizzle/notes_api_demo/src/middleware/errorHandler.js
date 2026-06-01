import config from '../config/index.js'

// 統一錯誤處理
export function errorHandler(err, req, res, next) {
  console.error('錯誤發生：', err.message)

  const statusCode = err.statusCode || 500
  const message = err.message || '伺服器內部錯誤'

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  })
}

// 404 處理
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `找不到路徑: ${req.method} ${req.originalUrl}`
  })
}
