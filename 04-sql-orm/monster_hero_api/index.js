import express from 'express'
import cors from 'cors'
import heroesRouter from './src/routes/heroes.js'
import monstersRouter from './src/routes/monsters.js'

const app = express()

app.use(cors())

// app.use(cors({
//   origin: 'http://localhost:5173',
//   method: ['GET', 'POST', 'PUT', 'DELETE']
// }))

app.use(express.json())
app.use('/heroes', heroesRouter)
app.use('/monsters', monstersRouter)

const PORT = 3000
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})