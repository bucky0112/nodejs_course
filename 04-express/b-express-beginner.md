## 比較兩者的寫法

### Node.js

```javascript
const http = require('http')

const server = http.createServer((req, res) => {
  const method = req.method
  if (method === 'GET') {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html')
    res.end('<h1>Hello World</h1>')
  }
})

server.listen(3000)
```

### Express

```javascript
const express = require('express')
const app = express()

app.get('/', (req, res) => {
  res.send('<h1>Hello World111</h1>')
})

app.listen(3000)
```