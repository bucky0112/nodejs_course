import 'dotenv/config'
import express from 'express'
import passport from 'passport'
import cookieParser from 'cookie-parser'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import useRouters from './src/routes/useRouters.js'
import morgan from 'morgan'
import cors from 'cors'
// Drizzle: 匯入 db 即自動建立連線池
import './src/configs/db.js'

const app = express()

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  done(null, profile)
}))

app.use(cors())

app.use('/auth', useRouters)

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})
