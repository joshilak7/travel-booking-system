const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add car name"],
    trim: true,
  },
  brand: {
    type: String,
    required: [true, "Please add brand"],
  },
  model: {
    type: String,
    required: [true, "Please add model"],
  },
  year: {
    type: Number,
    required: [true, "Please add year"],
  },
  pricePerDay: {
    type: Number,
    required: [true, "Please add price per day"],
  },
  seats: {
    type: Number,
    required: [true, "Please add number of seats"],
  },
  transmission: {
    type: String,
    enum: ["Manual", "Automatic"],
    required: true,
  },
  fuelType: {
    type: String,
    enum: ["Petrol", "Diesel", "Electric", "Hybrid"],
    required: true,
  },
  images: [
    {
      type: String,
    },
  ],
  description: {
    type: String,
    required: [true, "Please add description"],
  },
  available: {
    type: Boolean,
    default: true,
  },
  location: {
    type: String,
    required: [true, "Please add location"],
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      rating: Number,
      comment: String,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Car", carSchema);
