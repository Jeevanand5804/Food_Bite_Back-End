const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema({
  number: Number,
  foodName: String,
  Address: String,
  createdAt: { type: Date, default: Date.now, expires: "10h" },
});

const orderModel = mongoose.model("order", orderSchema);
module.exports = { orderModel };
