const express = require('express')
const connectDB = require('./src/configs/db')
const userRoutes = require('./src/routes/user')

const app = express()
app.use(express.json())

connectDB()

app.use('/api', userRoutes)

const PORT = 3000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})