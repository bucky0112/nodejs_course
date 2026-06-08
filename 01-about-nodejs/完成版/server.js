import http from 'node:http'

// 先用記憶體存資料（重啟就消失）
const todos = ['學習 Node.js', '認識 HTTP 模組', '完成 S0']

// 用 Node 內建的 http 模組做一個最陽春的伺服器
// 注意：路由要自己用 if/else 一個一個比對 req.url —— 很快就會很囉嗦
// 這正是下一章要換成 Express 的理由
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json')

  if (req.url === '/health') {
    res.writeHead(200)
    res.end(JSON.stringify({ status: 'success', message: 'OK' }))
  } else if (req.url === '/todos') {
    res.writeHead(200)
    res.end(JSON.stringify({ status: 'success', data: todos }))
  } else if (req.url === '/todos/count') {
    res.writeHead(200)
    res.end(JSON.stringify({ status: 'success', count: todos.length }))
  } else {
    res.writeHead(404)
    res.end(JSON.stringify({ status: 'error', message: '找不到頁面' }))
  }
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`伺服器運行在 http://localhost:${PORT}/`)
})
