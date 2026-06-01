import 'dotenv/config'

const config = {
  // 伺服器設定
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // 資料庫設定
  databaseUrl: process.env.DATABASE_URL
}

export default config
