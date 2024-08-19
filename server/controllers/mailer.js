const nodemailer = require("nodemailer");

// Load environment variables from .env file
require("dotenv").config();

// Create a transporter using your mail server settings
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: 587, // Use 587 if you're using a service like Gmail with STARTTLS, otherwise use 465 for SSL/TLS
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER, // Your email
    pass: process.env.MAIL_PASSWORD, // Your email password
  },
  authMethod: "LOGIN", // Use 'PLAIN' or 'CRAM-MD5' if needed
});

// Function to send OTP email
const sendOtpEmail = async (to, otp) => {
  const mailOptions = {
    from: `ShoppingZone By Jaskaran Singh <${process.env.MAIL_USER}>`,
    to,
    subject: "Your OTP Code",
    html: `<h2>Hello,</h2>
           <p>Your OTP code is <strong>${otp}</strong></p>`,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = { sendOtpEmail };
