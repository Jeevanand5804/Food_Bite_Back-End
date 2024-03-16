const mongoose = require("mongoose");
const { Schema } = mongoose;

const reservationSchema = new mongoose.Schema({
  email:String,
    name: String,
    number: Number,
    numberOfPeople: Number,
    date: Date,
    time: String,
  });
  
  const Reservation = mongoose.model('Reservation', reservationSchema);
  module.exports = { Reservation };