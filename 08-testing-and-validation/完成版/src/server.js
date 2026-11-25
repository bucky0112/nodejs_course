// server.js 負責「啟動」：把組好的 app 跑起來。
import { app } from './app.js'

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`伺服器啟動：http://localhost:${PORT}`)
})
