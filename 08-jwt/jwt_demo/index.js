import express from 'express'
import authRouter from './src/routes/authRoutes.js'

const app = express()
app.use(express.json())

app.use('/auth', authRouter)

app.listen(3000, () => {
  console.log('Server running on port 3000')
})
