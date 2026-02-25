const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  room: String,
  sender: String,
  text: String,
  image: String,
  time: String
});

module.exports = mongoose.model("Message", messageSchema);
