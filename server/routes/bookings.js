const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");

// @route   POST /api/bookings/inquiry
// @desc    Create booking inquiry
// @access  Public
router.post("/inquiry", async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      service,
      pickupDate,
      pickupLocation,
      passengers,
      carId,
      placeId,
      message,
    } = req.body;

    // Create new booking
    const booking = new Booking({
      bookingType: service,
      car: carId || null,
      place: placeId || null,
      pickupDate: new Date(pickupDate),
      pickupLocation: pickupLocation,
      numberOfPassengers: parseInt(passengers),
      fullName: fullName,
      email: email,
      phone: phone,
      specialRequests: message,
      message: message,
      status: "pending",
    });

    await booking.save();

    // Send WhatsApp notification to admin (optional)
    const adminWhatsapp = process.env.ADMIN_WHATSAPP || "919274713544";
    const whatsappMsg = `*New Booking Inquiry*%0A%0A📋 ID: ${booking.bookingReference}%0A👤 Name: ${fullName}%0A📞 Phone: ${phone}%0A📧 Email: ${email}%0A🚗 Service: ${service}%0A📅 Date: ${pickupDate}%0A📍 Location: ${pickupLocation}%0A👥 Passengers: ${passengers}%0A💬 Message: ${message || "No message"}%0A%0A🔗 View: https://dhwanitourist.com/admin/bookings/${booking._id}`;

    res.status(201).json({
      success: true,
      message: "Booking inquiry sent successfully",
      bookingReference: booking.bookingReference,
      data: booking,
    });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create booking. Please try again.",
    });
  }
});

// @route   GET /api/bookings/:reference
// @desc    Get booking by reference
// @access  Public
router.get("/:reference", async (req, res) => {
  try {
    const booking = await Booking.findOne({
      bookingReference: req.params.reference,
    });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/bookings/phone/:phone
// @desc    Get bookings by phone number
// @access  Public
router.get("/phone/:phone", async (req, res) => {
  try {
    const bookings = await Booking.find({ phone: req.params.phone }).sort({
      createdAt: -1,
    });
    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
