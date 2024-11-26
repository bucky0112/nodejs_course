// const mysql = require('mysql2/promise')

// const pool = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: 'root',
//   database: 'nov_25',
// })

// module.exports = pool

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = prisma