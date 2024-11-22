const express = require("express")
const app = express()
const router = require("./src/routes/index")

app.use(express.json())
app.use("/api", router)

app.listen(3000)
