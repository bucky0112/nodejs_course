import express from 'express'
import usersRouter from './src/routes/users.js'
import postsRouter from './src/routes/posts.js'
import likesRouter from './src/routes/likes.js'

const app = express()

app.use(express.json())
app.use("/users", usersRouter)
app.use("/posts", postsRouter)
app.use("/likes", likesRouter)

// 全域錯誤處理 middleware。
// Express 5 會自動把 async route handler 拋出的錯誤（rejected promise）
// 轉送到這裡，所以各 controller 即使沒寫 try/catch，DB 錯誤也會回 500
// 而不會讓請求卡住。
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: "伺服器錯誤", message: err.message })
})

app.listen(3000, () => {
  console.log("Server is running on port 3000")
})
