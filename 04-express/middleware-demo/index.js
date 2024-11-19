const express = require("express")
const app = express()

app.use(logger)

app.get("/", (req, res, next) => {
  console.log("首頁")
  // res.send("<h1>Hello World1111</h1>")
  res.json({ message: "首頁" })
})

app.get("/about", (req, res) => {
  console.log("about 頁面")
  // res.send("<h1>About</h1>")
  res.json({ message: "About" })
})

app.get("/users", auth, (req, res) => {
  console.log("users 頁面")
  // res.send("<h1>Users</h1>")
  res.json({ message: "Users" })
})

function auth (req, res, next) {
  // http://localhost:3100/users?admin=true
  console.log(req.query) // { admin: 'true' }
  console.log("auth")
  // next()

  if (req.query.admin === "true") {
    next()
    return
  }
  // res.send("<h1>你沒有權限</h1>")
  res.json({ message: "你沒有權限" })
}

function logger (req, res, next) {
  console.log("log")
  next()
}

app.listen(3100)