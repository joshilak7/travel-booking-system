const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  // User Reference (optional - for logged-in users)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Made optional for non-logged users
  },

  // Booking Type
  bookingType: {
    type: String,
    enum: ["car", "tour", "both"],
    required: true,
  },

  // Selected Items
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Car",
  },
  carName: String,
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Place",
  },
  placeName: String,

  // Trip Details
  pickupDate: {
    type: Date,
    required: true,
  },
  pickupLocation: {
    type: String,
    required: true,
  },
  numberOfPassengers: {
    type: Number,
    required: true,
    min: 1,
  },
  specialRequests: String,

  // Contact Details
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },

  // Booking Status
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending",
  },

  // Notification Status
  notificationSent: {
    customer: { type: Boolean, default: false },
    admin: { type: Boolean, default: false },
  },

  // Unique Booking Reference
  bookingReference: {
    type: String,
    unique: true,
  },

  // Inquiry Message
  message: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate unique booking reference before saving
bookingSchema.pre("save", async function (next) {
  if (!this.bookingReference) {
    const prefix =
      this.bookingType === "car"
        ? "CAR"
        : this.bookingType === "tour"
          ? "TOUR"
          : "PKG";
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const date = new Date();
    const dateStr = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}`;
    this.bookingReference = `${prefix}${dateStr}${randomNum}`;
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Booking", bookingSchema);
