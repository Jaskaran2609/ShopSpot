const User = require("../models/userSchema");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { sendOtpEmail } = require("./mailer");

exports.register = async (req, res) => {
  const { firstName, lastName, email, password, confirmpassword } = req.body;
  console.log("email i have in .env is ", process.env.MAIL_USER);

  try {
    console.log(
      "the input i received is ",
      firstname,
      lastName,
      email,
      password,
      confirmpassword
    );
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Secure the password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Error in hashing the password",
      });
    }

    // Generate OTP
    const otp = crypto.randomBytes(3).toString("hex");
    const otpExpires = Date.now() + 3600000; // OTP expires in 1 hour

    // Save user with hashed password, OTP and expiry time
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
    });
    await newUser.save();

    // Send OTP email
    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // OTP is correct and not expired, clear the OTP fields
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
