const express = require("express");
const router = express.Router();
const twilio = require("twilio");
const Booking = require("../models/Booking");
const User = require("../models/User");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

// ==============================
// SEND BOOKING CONFIRMATION
// ==============================
router.post("/send-booking-confirmation", async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate("user")
      .populate("itemId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const itemName = booking.itemId?.name || "Travel Service";

    const message =
      `🎉 *Booking Confirmed!* 🎉\n\n` +
      `Hello ${booking.user.name},\n\n` +
      `Your booking has been confirmed successfully.\n\n` +
      `📋 *Booking Details*\n` +
      `━━━━━━━━━━━━━━━\n` +
      `🚗 Type: ${booking.bookingType.toUpperCase()}\n` +
      `📌 Item: ${itemName}\n` +
      `📅 Start: ${new Date(booking.startDate).toLocaleDateString()}\n` +
      `📅 End: ${new Date(booking.endDate).toLocaleDateString()}\n` +
      `💰 Total: ₹${booking.totalPrice}\n\n` +
      `Thank you for choosing TravelBooking ❤️\n\n` +
      `📞 Support: +91 92747 13544`;

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${booking.user.phone}`,
    });

    res.json({
      success: true,
      message: "WhatsApp message sent successfully",
    });
  } catch (error) {
    console.error("WhatsApp Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send WhatsApp message",
    });
  }
});

// ==============================
// SEND INQUIRY
// ==============================
router.post("/send-inquiry", async (req, res) => {
  try {
    const { name, email, phone, message: inquiryMessage } = req.body;

    const message =
      `📩 *New Inquiry Received*\n\n` +
      `👤 Name: ${name}\n` +
      `📧 Email: ${email}\n` +
      `📞 Phone: ${phone}\n\n` +
      `📝 Message:\n${inquiryMessage}\n\n` +
      `Please contact the customer soon.`;

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: "whatsapp:+919274713544",
    });

    res.json({
      success: true,
      message: "Inquiry sent successfully",
    });
  } catch (error) {
    console.error("Inquiry Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send inquiry",
    });
  }
});

module.exports = router;
