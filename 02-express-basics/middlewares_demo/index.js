import express from 'express'

const app = express()

const requestLogs = []

const requestTimer = (req, res, next) => {
  const startTime = Date.now()

  res.on('finish', () => {
    const endTime = Date.now()
    const duration = endTime - startTime

    const log = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    }
    requestLogs.push(log)
  })

  next()
}

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization
  if (!token) {
    return res.status(401).json({ error: '未提供認證 token' })
  }
  // 驗證 token 邏輯
  next()
}

app.use(requestTimer)
app.use(authMiddleware)
// app.use((req, res) => {
//   res.status(404).json({ error: '路徑錯誤' });
// });

app.get('/logs', (req, res) => {
  res.json(requestLogs)
})

app.get('/hello', (req, res) => {
  res.send('Hello')
})

const port = 3000
app.listen(port, () => {
  console.log(`伺服器已啟動在 http://localhost:${port}`)
})
