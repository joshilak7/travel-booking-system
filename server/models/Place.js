const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add place name"],
    trim: true,
  },
  city: {
    type: String,
    required: [true, "Please add city"],
  },
  state: {
    type: String,
    required: [true, "Please add state"],
  },
  country: {
    type: String,
    required: [true, "Please add country"],
    default: "India",
  },
  description: {
    type: String,
    required: [true, "Please add description"],
  },
  images: [
    {
      type: String,
    },
  ],
  entryFee: {
    type: Number,
    default: 0,
  },
  bestTimeToVisit: {
    type: String,
  },
  openingHours: {
    type: String,
  },
  category: {
    type: String,
    enum: [
      "Beach",
      "Mountain",
      "Historical",
      "Temple",
      "City",
      "Forest",
      "Desert",
    ],
    required: true,
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
  location: {
    lat: Number,
    lng: Number,
  },
  popularAttractions: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Place", placeSchema);
