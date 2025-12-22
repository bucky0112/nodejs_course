import http from 'http'

const todos = ['學習 Node.js', '學習 HTTP 模組', '完成作業']

// 創建基本的 HTTP 伺服器
const server = http.createServer((req, res) => {
  // 設定回應標頭
  res.setHeader('Content-Type', 'application/json')

  // 根據請求路徑回應不同內容
  if (req.url === '/health') {
    res.writeHead(200)
    res.end(
      JSON.stringify({
        status: 'success',
        message: 'OK'
      })
    )
  } else if (req.url === '/todos') {
    res.writeHead(200)
    res.end(
      JSON.stringify({
        status: 'success',
        data: todos
      })
    )
  } else if (req.url === '/todos/count') {
    res.writeHead(200)
    res.end(
      JSON.stringify({
        status: 'success',
        count: todos.length
      })
    )
  } else {
    res.writeHead(404)
    res.end(JSON.stringify({ error: '找不到頁面' }))
  }
})

// 監聽 3000 port
server.listen(3000, () => {
  console.log('伺服器運行在 http://localhost:3000/')
})
