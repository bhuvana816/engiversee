"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onAppointmentCreated = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
admin.initializeApp();
// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});
exports.onAppointmentCreated = functions.firestore
    .document('appointments/{appointmentId}')
    .onCreate(async (snap, context) => {
    const appointment = snap.data();
    if (!appointment) {
        console.error('No appointment data found');
        return null;
    }
    const { name, email, sessionType, date, time, bookingId, status } = appointment;
    // Create email content
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Appointment Confirmation',
        html: `
        <h1>Appointment Confirmation</h1>
        <p>Dear ${name},</p>
        <p>Your appointment has been successfully booked. Here are the details:</p>
        <ul>
          <li><strong>Booking ID:</strong> ${bookingId}</li>
          <li><strong>Session Type:</strong> ${sessionType}</li>
          <li><strong>Date:</strong> ${date}</li>
          <li><strong>Time:</strong> ${time}</li>
          <li><strong>Status:</strong> ${status}</li>
        </ul>
        <p>Please keep this information for your records.</p>
        <p>Best regards,<br>Your Appointment System</p>
      `
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent successfully');
        return null;
    }
    catch (error) {
        console.error('Error sending confirmation email:', error);
        return null;
    }
});
//# sourceMappingURL=index.js.map