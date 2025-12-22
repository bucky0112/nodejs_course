import express from 'express'
import 'dotenv/config'
import connectDB from './config/db.js'
import userRoutes from './routes/user.js'
import todosRoutes from './routes/todos.js'

connectDB()

const app = express()

app.use(express.json())
app.use('/api', userRoutes)
app.use('/api', todosRoutes)

app.listen(3000, () => {
  console.log('已運作在 http://localhost:3000')
})
