// Import mongoose
const mongoose = require("mongoose");

// Route handler
const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  purchasedby: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

// Virtual property to get the id from _id
itemSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
itemSchema.set("toJSON", {
  virtuals: true,
});

// Export
module.exports = mongoose.model("Item", itemSchema);
