import { app } from './app.js'

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`伺服器啟動：http://localhost:${PORT}`)
})
