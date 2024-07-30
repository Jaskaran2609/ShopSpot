const mongoose = require("mongoose");

//route handler
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  itemsPurchased: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },
  ],
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
});

//export
module.exports = mongoose.model("User", userSchema);
