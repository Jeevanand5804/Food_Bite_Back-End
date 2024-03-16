const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema({
  email:String,
  number: Number,
  foodName: String,
  Address: String,
  createdAt: { type: Date, default: Date.now },
});

const orderModel = mongoose.model("order", orderSchema);
module.exports = { orderModel };
