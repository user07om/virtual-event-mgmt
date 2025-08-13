const { Schema, model } = require("mongoose")

const EventSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },

  description: {
    type: String,
    required: true
  },

  participants: [{
    type: Schema.Types.ObjectId,
    ref: "User", 
  }],

  date: {type: String},
  time: {type: String}

}, {timestapms: true})


const Event = model("Event", EventSchema);
module.exports = Event
