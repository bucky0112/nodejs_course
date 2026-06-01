import 'dotenv/config'
import app from './src/app.js'

const PORT = process.env.PORT || 3002

app.listen(PORT, () => {
  console.log(`Todo Auth API running on http://localhost:${PORT}`)
})
