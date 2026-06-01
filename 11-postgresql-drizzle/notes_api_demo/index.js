import app from './src/app.js'
import config from './src/config/index.js'

app.listen(config.port, () => {
  console.log(`伺服器啟動於 http://localhost:${config.port}`)
  console.log(`環境: ${config.nodeEnv}`)
})
