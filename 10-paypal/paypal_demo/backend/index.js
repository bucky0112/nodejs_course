import express from 'express'
import route from './src/routes/order.js'
import bodyParser from 'body-parser'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(bodyParser.json())
// app.use(express.json())
app.use('/api', route)

app.listen(3000, () => {
  console.log('已運作在 http://localhost:3000')
})
