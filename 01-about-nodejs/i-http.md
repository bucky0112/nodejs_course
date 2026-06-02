# http 模組

```
import http from 'node:http';

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

1. 伺服器監聽在 port 3000
2. 實作以下 API 端點：
 - GET /todos：回傳所有待辦事項清單
 - GET /todos/count：回傳目前待辦事項的數量
 - GET /health：回傳伺服器狀態檢查（回傳 "OK"）

```
const todos = [
    "學習 Node.js",
    "學習 HTTP 模組",
    "完成作業"
];
```

```
{
    "status": "success",
    "data": ["學習 Node.js", "學習 HTTP 模組", "完成作業"]
}
```