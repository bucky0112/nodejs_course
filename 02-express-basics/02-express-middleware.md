# Express Middleware

Middleware 是 Express 中非常重要的概念，它可以在請求處理過程中執行額外的功能。將介紹常用的 middleware 和如何建立自定義 middleware。

**Middleware 是 Express 處理 HTTP 請求時的中間處理層，用於執行各種任務**

```
const firstMiddleware = (req, res, next) => {
  console.log('firstMiddleware')
  next()
}

app.use(firstMiddleware)
```

## 主要優點：

- 程式碼可重複使用
- 可以依序處理請求
- 容易擴展功能
- 關注點分離

## 常用 Middleware

### 內建 Middleware

```javascript
import express from 'express';
const app = express();

// 解析 JSON 格式
app.use(express.json());
```

### CORS Middleware

```javascript
// 安裝 cors
// npm install cors

import cors from 'cors';

// 啟用所有來源的 CORS
app.use(cors());

// 或設定特定來源
app.use(cors({
  origin: 'http://localhost:3000'
}));
```

## 自定義 Middleware

### 請求記錄 Middleware

```javascript
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});
```

### 驗證 Middleware

```javascript
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: '未提供認證 token' });
  }
  // 驗證 token 邏輯
  next();
};
```

## 練習題：API 請求記錄系統

實作一個 API 請求記錄系統，需要包含以下功能：

1. 記錄所有 API 請求的詳細資訊
2. 計算請求處理時間
3. 將記錄儲存在記憶體中
4. 提供 API 來查詢記錄

### 實作提示

1. 建立一個自定義 middleware 來記錄請求
2. 使用陣列儲存記錄
3. 實作查詢記錄的 API
4. 處理時間可以用 Date.now()
5. res.on('finish', () => { /* 可在這裡執行回應結束應該做的邏輯 */ })

### 預期結果

```javascript
// 記錄格式
{
  "timestamp": "2026-01-01T15:23:38.298Z",
  "method": "POST",
  "url": "/api/users",
  "statusCode": 201,
  "duration": "21ms"
}

// API
GET /api/logs
```