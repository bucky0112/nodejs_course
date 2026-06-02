import { Client, Environment } from '@paypal/paypal-server-sdk'
import 'dotenv/config'

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env

// 只確認憑證是否載入，切勿印出 secret 本身（會洩漏到 log／CI／共享畫面）
if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  throw new Error('缺少 PAYPAL_CLIENT_ID 或 PAYPAL_CLIENT_SECRET，請檢查 .env')
}

const paypalClient = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: PAYPAL_CLIENT_ID,
    oAuthClientSecret: PAYPAL_CLIENT_SECRET
  },
  environment: Environment.Sandbox // 測試環境
})

export default paypalClient
