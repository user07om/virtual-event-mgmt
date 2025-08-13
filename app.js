const express = require("express");
const dotenv = require("dotenv").config({ path: [".env.local"]});

// local imports
const userRoute = require("./routers/user-router.js");
const eventRoute = require("./routers/event-router.js");


// app initialization.
const app = express()
app.use(express.json()) // for json data parsing.

// health check route.
app.get("/api/health", (req, res) => {
  res.status(200).send(`health check, uptime: ${process.uptime()}`)
})

// user route ---
app.use("/api", userRoute)
app.use("/api", eventRoute)

module.exports = app


