const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema({
  username:String,
  email:String,
  number: Number,
  foodItems: [
    {
      name: String,
      quantity: Number,
      price: Number
    }
  ],
  // foodName: String,
  Address: String,
  createdAt: { type: Date, default: Date.now },
});

const orderModel = mongoose.model("order", orderSchema);
module.exports = { orderModel };
