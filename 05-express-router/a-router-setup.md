## 如何建立一個 Router

```javascript
const express = require('express')
const router = express.Router() // Express 內建的 Router

module.exports = router // 最後 export 出去給其他檔案使用
```

## 將專案更有結構化的做法

```
src/
├── routes/
│   ├── index.js
│   └── products.js
└── middlewares/
    ├── logger.js
    └── auth.js
```

結構化有以下優點：

- 模組化：每個功能都被分離成獨立的模組，更容易維護和測試
- 可重用性：middleware 可以在不同的路由中重複使用
- 可擴展性：如果需要增加新的路由或 middleware，只需要新增相對應的邏輯
- 關注點分離：每個檔案都專注於特定的功能

## middleware

```javascript
function logger(req, res, next) {
  console.log('middleware')
  next()
}

module.exports = logger // 把這個函式 export 出去
```