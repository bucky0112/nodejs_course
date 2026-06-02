# Express 路由基礎

Express.js 提供了簡單且強大的路由系統，支援各種 HTTP 方法。本節將介紹如何建立和使用路由。

## 基本路由設定

```javascript
import express from 'express';
const app = express();
const port = 3000;

// 建立一個陣列來儲存使用者資料
const users = [];

// 解析 JSON 格式
app.use(express.json());

// 
app.get('/', (req, res) => {
  res.send('首頁');
});

// GET
app.get('/api/users', (req, res) => {
  res.json(users);
});

// POST
app.post('/api/users', (req, res) => {
  const newUser = {
    id: users.length + 1,
    phone: req.body.phone
  };
  users.push(newUser);
  res.status(201).json({  // 201 跟 200 的差異是 201 是建立新的資源
    message: '使用者已建立',
    user: newUser
  });
});

// PUT
app.put('/api/users/:id', (req, res) => {
  const userId = Number.parseInt(req.params.id);
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ message: '找不到該使用者' });
  }

  users[userIndex] = {
    ...users[userIndex],
    phone: req.body.phone
  };

  res.json({
    message: '使用者已更新',
    user: users[userIndex]
  });
});

// DELETE
app.delete('/api/users/:id', (req, res) => {
  const userId = Number.parseInt(req.params.id);
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ message: '找不到該使用者' });
  }

  users.splice(userIndex, 1);
  res.json({ message: `使用者 ${userId} 已刪除` });
});

app.listen(port, () => {
  console.log(`伺服器運行在 http://localhost:${port}`);
});
```

## 路由方法

Express 支援所有 HTTP 方法：
- GET：取得資源
- POST：新增資源
- PUT：更新資源
- DELETE：刪除資源
- PATCH：部分更新資源

## 練習題：待辦事項 API

實作一個簡單的待辦事項 API，需要包含以下功能：

1. 取得所有待辦事項 (GET /todos)
2. 新增待辦事項 (POST /todos)
3. 更新待辦事項狀態 (PUT /todos/:id)
4. 刪除待辦事項 (DELETE /todos/:id)

### 待辦事項資料結構

```javascript
{
  id: number,
  title: string,
  completed: boolean,
  createdAt: Date
}
```

### 實作提示

1. 使用陣列儲存待辦事項
2. 使用 Date.now() 產生唯一 ID
3. 使用適當的 HTTP 狀態碼

### 預期結果

```bash
# 取得所有待辦事項
GET http://localhost:3000/todos
Response: [
  {
    "id": 1,
    "title": "學習 Express",
    "completed": false,
    "createdAt": "2024-03-20T10:00:00.000Z"
  }
]

# 新增待辦事項
POST http://localhost:3000/todos
Content-Type: application/json
{
  "title": "完成作業"
}
Response: {
  "id": 2,
  "title": "完成作業",
  "completed": false,
  "createdAt": "2024-03-20T10:30:00.000Z"
}

# 更新待辦事項
PUT http://localhost:3000/todos/1
Content-Type: application/json
{
  "completed": true
}
Response: {
  "id": 1,
  "title": "學習 Express",
  "completed": true,
  "createdAt": "2024-03-20T10:00:00.000Z"
}

# 刪除待辦事項
DELETE http://localhost:3000/todos/1
Response: 204 No Content
``` 