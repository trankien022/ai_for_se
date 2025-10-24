const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  model: { type: String, required: true },
  rentalPricePerDay: { type: Number, required: true },
  rentalPricePerMonth: { type: Number, required: true },
  depositPerDay: { type: Number, required: true },
  depositPerMonth: { type: Number, required: true },
  seats: { type: Number, required: true },
  range: { type: String, required: true },
  vehicleType: { type: String, required: true },
  features: [{ type: String }]
});

module.exports = mongoose.model('Model', vehicleSchema);