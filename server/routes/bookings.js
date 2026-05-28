const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Car = require("../models/Car");
const Place = require("../models/Place");
const { protect } = require("../middleware/auth");

// @route   POST /api/bookings
// @desc    Create a booking
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const {
      bookingType,
      itemId,
      startDate,
      endDate,
      guests,
      specialRequests,
      contactNumber,
    } = req.body;

    let totalPrice = 0;
    let item;

    if (bookingType === "car") {
      item = await Car.findById(itemId);
      if (!item) {
        return res
          .status(404)
          .json({ success: false, message: "Car not found" });
      }
      const days = Math.ceil(
        (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24),
      );
      totalPrice = item.pricePerDay * days;
    } else {
      item = await Place.findById(itemId);
      if (!item) {
        return res
          .status(404)
          .json({ success: false, message: "Place not found" });
      }
      totalPrice = item.entryFee * guests;
    }

    const booking = await Booking.create({
      user: req.user.id,
      bookingType,
      itemId,
      startDate,
      endDate,
      totalPrice,
      guests: guests || 1,
      specialRequests,
      contactNumber: contactNumber || req.user.phone,
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   GET /api/bookings
// @desc    Get all bookings for logged in user
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("itemId")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("itemId");

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (
      booking.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }

    res.json({ success: true, booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private
router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }

    if (booking.status === "cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "Booking already cancelled" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ success: true, booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   PUT /api/bookings/:id/confirm
// @desc    Confirm a booking (Admin only)
// @access  Private/Admin
router.put("/:id/confirm", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    booking.status = "confirmed";
    booking.paymentStatus = "paid";
    await booking.save();

    res.json({ success: true, booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
