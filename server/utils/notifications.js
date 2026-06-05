const nodemailer = require("nodemailer");
const twilio = require("twilio");

// Email Configuration
const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// WhatsApp/Twilio Configuration
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

// Send Booking Confirmation Email
const sendBookingEmail = async (booking, user, type = "confirmation") => {
  const templates = {
    confirmation: {
      subject: `Booking Confirmation - ${booking.bookingReference}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #007bff; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .booking-details { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; }
            .status { display: inline-block; padding: 5px 10px; background: #28a745; color: white; border-radius: 4px; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            .label { font-weight: bold; width: 40%; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Dhwani Tourist</h2>
              <p>Booking Confirmation</p>
            </div>
            <div class="content">
              <h3>Dear ${booking.fullName},</h3>
              <p>Thank you for booking with Dhwani Tourist! Your booking has been confirmed.</p>
              
              <div class="booking-details">
                <h4>Booking Details</h4>
                <table>
                  <tr><td class="label">Booking ID:</td><td>${booking.bookingReference}</td></tr>
                  <tr><td class="label">Booking Type:</td><td>${booking.bookingType.toUpperCase()}</td></tr>
                  <tr><td class="label">Status:</td><td><span class="status">${booking.status}</span></td></tr>
                  <tr><td class="label">Total Amount:</td><td>₹${booking.totalAmount}</td></tr>
                  <tr><td class="label">Advance Paid:</td><td>₹${booking.advanceAmount}</td></tr>
                  ${booking.carName ? `<tr><td class="label">Car:</td><td>${booking.carName}</td></tr>` : ""}
                  ${booking.placeName ? `<tr><td class="label">Destination:</td><td>${booking.placeName}</td></tr>` : ""}
                  <tr><td class="label">Pickup Date:</td><td>${new Date(booking.pickupDate).toLocaleDateString()}</td></tr>
                  <tr><td class="label">Pickup Location:</td><td>${booking.pickupLocation}</td></tr>
                  <tr><td class="label">Passengers:</td><td>${booking.numberOfPassengers}</td></tr>
                </table>
              </div>
              
              <p><strong>Important Information:</strong></p>
              <ul>
                <li>Please carry a valid ID proof for verification</li>
                <li>Reach the pickup location 15 minutes before the scheduled time</li>
                <li>For any assistance, contact us at +91 9274713544</li>
              </ul>
              
              <p>We look forward to serving you!</p>
              <p>Best regards,<br><strong>Dhwani Tourist Team</strong></p>
            </div>
            <div class="footer">
              <p>Dhwani Tourist | Near City Center, Ahmedabad, Gujarat | +91 9274713544</p>
              <p>&copy; 2024 Dhwani Tourist. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    },
    cancellation: {
      subject: `Booking Cancellation - ${booking.bookingReference}`,
      html: `
        <div class="container">
          <h2>Booking Cancellation Confirmation</h2>
          <p>Dear ${booking.fullName},</p>
          <p>Your booking (${booking.bookingReference}) has been cancelled as requested.</p>
          ${booking.refundAmount ? `<p>Refund Amount: ₹${booking.refundAmount}</p>` : ""}
          <p>For any queries, please contact our support team.</p>
        </div>
      `,
    },
    reminder: {
      subject: `Booking Reminder - ${booking.bookingReference}`,
      html: `
        <div class="container">
          <h2>Booking Reminder</h2>
          <p>Dear ${booking.fullName},</p>
          <p>This is a reminder for your upcoming booking with Dhwani Tourist.</p>
          <p><strong>Date:</strong> ${new Date(booking.pickupDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${booking.pickupTime || "As scheduled"}</p>
          <p>We look forward to serving you!</p>
        </div>
      `,
    },
  };

  const template = templates[type] || templates.confirmation;

  try {
    await emailTransporter.sendMail({
      from: `"Dhwani Tourist" <${process.env.EMAIL_USER}>`,
      to: booking.email,
      subject: template.subject,
      html: template.html,
    });
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
};

// Send WhatsApp Notification
const sendWhatsAppNotification = async (booking, type = "confirmation") => {
  const messages = {
    confirmation: `✅ *Booking Confirmed!*\n\nDear ${booking.fullName},\n\nYour booking with Dhwani Tourist has been confirmed.\n\n📋 *Booking ID:* ${booking.bookingReference}\n🚗 *Service:* ${booking.bookingType.toUpperCase()}\n📅 *Date:* ${new Date(booking.pickupDate).toLocaleDateString()}\n📍 *Pickup:* ${booking.pickupLocation}\n💰 *Amount:* ₹${booking.totalAmount}\n\nFor assistance, contact: +91 9274713544`,

    reminder: `🔔 *Booking Reminder*\n\nDear ${booking.fullName},\n\nYour booking with Dhwani Tourist is scheduled for tomorrow.\n\n📋 *Booking ID:* ${booking.bookingReference}\n📅 *Date:* ${new Date(booking.pickupDate).toLocaleDateString()}\n📍 *Pickup:* ${booking.pickupLocation}\n\nPlease be ready on time. For any changes, contact us.`,

    cancellation: `❌ *Booking Cancelled*\n\nDear ${booking.fullName},\n\nYour booking (${booking.bookingReference}) has been cancelled as requested.\n\nFor any queries, please contact our support team.`,
  };

  const message = messages[type] || messages.confirmation;

  try {
    await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:${booking.phone}`,
    });
    return true;
  } catch (error) {
    console.error("WhatsApp sending failed:", error);
    return false;
  }
};

// Send SMS Notification
const sendSMSNotification = async (booking, type = "confirmation") => {
  const messages = {
    confirmation: `Dhwani Tourist: Booking confirmed! ID: ${booking.bookingReference}. Total: ₹${booking.totalAmount}. Call +919274713544 for support.`,
    reminder: `Dhwani Tourist Reminder: Your booking (${booking.bookingReference}) is tomorrow. Be ready on time.`,
    cancellation: `Dhwani Tourist: Your booking ${booking.bookingReference} has been cancelled.`,
  };

  try {
    await twilioClient.messages.create({
      body: messages[type],
      from: process.env.TWILIO_PHONE_NUMBER,
      to: booking.phone,
    });
    return true;
  } catch (error) {
    console.error("SMS sending failed:", error);
    return false;
  }
};

// Send Admin Notification
const sendAdminNotification = async (booking) => {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@dhwanitourist.com";
  const adminPhone = process.env.ADMIN_PHONE || "+919274713544";

  const adminMessage = `
    🚨 *New Booking Received!* 🚨
    
    📋 *Booking ID:* ${booking.bookingReference}
    👤 *Customer:* ${booking.fullName}
    📞 *Phone:* ${booking.phone}
    📧 *Email:* ${booking.email}
    🚗 *Service:* ${booking.bookingType.toUpperCase()}
    📅 *Date:* ${new Date(booking.pickupDate).toLocaleDateString()}
    📍 *Pickup:* ${booking.pickupLocation}
    💰 *Amount:* ₹${booking.totalAmount}
    
    Please process this booking.
  `;

  try {
    // Send WhatsApp to admin
    await twilioClient.messages.create({
      body: adminMessage,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:${adminPhone}`,
    });

    // Send email to admin
    await emailTransporter.sendMail({
      from: `"Booking System" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `New Booking - ${booking.bookingReference}`,
      html: `<pre>${adminMessage}</pre>`,
    });

    return true;
  } catch (error) {
    console.error("Admin notification failed:", error);
    return false;
  }
};

module.exports = {
  sendBookingEmail,
  sendWhatsAppNotification,
  sendSMSNotification,
  sendAdminNotification,
};
