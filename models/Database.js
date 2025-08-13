const mongoose = require("mongoose")

const connectDB = async uri => {
  try {
    await mongoose.connect(uri);
    console.log("database connected");
  } catch (err) {
    console.log(`error is --- ${err}`); 
  }
} 

module.exports = connectDB;
