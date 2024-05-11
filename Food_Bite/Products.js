const mongoose = require('mongoose');

// Define the product schema
const productSchema = new mongoose.Schema({
  productImage: {
    type: String,
    required: true
  },
  title:{
    type:String,
    required:true
  },
  price: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
});

// Create a Product model using the schema
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
