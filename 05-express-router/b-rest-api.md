## RESTful API

### 使用 HTTP 方法對應 CRUD 操作

```javascript
// Create
app.post('/users')
// Read
app.get('/users')
app.get('/users/:id')
// Update
app.put('/users/:id')
// Delete
app.delete('/users/:id')
```

### 命名

```javascript
// 使用複數名詞
app.get('/users')  // ✅ 好
app.get('/user')   // ❌ 避免

// 使用巢狀結構表示關聯
app.get('/users/:userId/posts')  // ✅ 好
app.get('/users-posts')          // ❌ 避免
```

### 狀態碼使用

```javascript
app.post('/users', (req, res) => {
  // 201: Created
  res.status(201).json({ message: '建立成功' })
})

app.get('/users/:id', (req, res) => {
  // 404: Not Found
  if (!user) {
    return res.status(404).json({ error: '找不到用戶' })
  }
  // 200: OK
  res.json(user)
})
```

### 查詢參數

```javascript
app.get('/users', (req, res) => {
  const { page = 1, limit = 10 } = req.query
  // GET /users?page=1&limit=10
})
```