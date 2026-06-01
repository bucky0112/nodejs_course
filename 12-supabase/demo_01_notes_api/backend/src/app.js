import express from 'express'
import cors from 'cors'
import routes from './routes/index.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api', routes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  })
})

export default app
