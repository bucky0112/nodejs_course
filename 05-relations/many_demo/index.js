import express from 'express'
import usersRouter from './src/routes/users.js'
import postsRouter from './src/routes/posts.js'
import likesRouter from './src/routes/likes.js'

const app = express()

app.use(express.json())
app.use("/users", usersRouter)
app.use("/posts", postsRouter)
app.use("/likes", likesRouter)

app.listen(3000, () => {
  console.log("Server is running on port 3000")
})
