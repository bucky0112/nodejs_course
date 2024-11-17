# http 模組

```
const http = require('http');

// 創建基本的 HTTP 伺服器
const server = http.createServer((req, res) => {
  // 設定回應標頭
  res.setHeader('Content-Type', 'application/json');
  
  // 根據請求路徑回應不同內容
  if (req.url === '/') {
    res.writeHead(200);
    res.end(JSON.stringify({ message: '歡迎來到首頁' }));
  } else if (req.url === '/api/users') {
    res.writeHead(200);
    res.end(JSON.stringify({ users: ['使用者1', '使用者2'] }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: '找不到頁面' }));
  }
});

// 監聽 3000 port
server.listen(3000, () => {
  console.log('伺服器運行在 http://localhost:3000/');
});
```