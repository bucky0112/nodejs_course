// require('dotenv').config()
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGOOB_URL)
    console.log(`MongoDB 已連結`)
  } catch (err) {
    console.error(`Error: ${err.message}`)
  }
}

module.exports = connectDB
