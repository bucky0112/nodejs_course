const express = require('express')
const app = express()
const heroesRouter = require('./src/routes/heroes')
const monstersRouter = require('./src/routes/monsters')

app.use(express.json())
app.use('/heroes', heroesRouter)
app.use('/monsters', monstersRouter)

const PORT = 3000
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})