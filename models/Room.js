const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  code: { type: String, unique: true }
});

module.exports = mongoose.model("Room", roomSchema);
