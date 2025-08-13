const app = require("./app.js")
const connectDB = require("./models/Database.js")
const dotenv = require("dotenv").config({path: [".env.local"]})

app.listen(process.env.PORT, () => {
  connectDB(process.env.MONGO_URI);
  console.log(`server is listening on ${process.env.PORT}!`);
})
