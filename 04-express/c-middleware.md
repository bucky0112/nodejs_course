# Middleware

Middleware 是 Express 處理 HTTP 請求時的中間處理層，用於執行各種任務

```javascript
const firstMiddleware = (req, res, next) => {
  console.log('firstMiddleware')
  next()
}

app.use(firstMiddleware)
```

主要優點：

- 程式碼重用性高
- 可以依序處理請求
- 容易擴展功能
- 關注點分離

```javascript
// 處理所有請求
app.use((req, res, next) => {
  console.log('所有請求都會執行')
  next()
})

// 只處理 GET / 請求
app.get('/', (req, res) => {
  res.send('Hello')
})

// 只處理 POST / 請求
app.post('/', (req, res) => {
  res.send('Post received')
})
```