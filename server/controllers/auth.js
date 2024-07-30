const bcrypt = require("bcryptjs");
const User = require("../models/userSchema");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendOtpEmail } = require("./mailer");

require("dotenv").config();

exports.signup = async (req, res) => {
  try {
    console.log("mai aaya ");
    const { firstName, lastName, email, password, confirmPassword } = req.body;
    console.log("mai aaya ");
    // Basic validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      console.log("bahar ja rha hoo ");
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields",
      });
    }
    console.log("mai aaya ");
    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("bahar ja rhi hoo ");
      return res.status(400).json({
        success: false,
        message: "User already exists, can't sign up again",
      });
    }

    // Secure the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = crypto.randomBytes(3).toString("hex");
    const otpExpires = Date.now() + 3600000; // OTP expires in 1 hour

    // Create and store the user with OTP and hashed password
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

    return res.status(200).json({
      success: true,
      message: "OTP sent to email",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again later",
    });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log("yaha se ja rhi hoo 1");
      return res.status(400).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      console.log("yaha se ja rhi hoo 2");
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // OTP is correct and not expired, clear the OTP fields
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.log("yaha se ja rhi hoo 3");
    res.status(500).json({ message: "Server error" });
  }
};

// login route handler
exports.login = async (req, res) => {
  try {
    console.log("Login request received");
    const { email, password } = req.body;

    // validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the details carefully",
      });
    }

    // check for registered user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered",
      });
    }

    // verify password and generate a JWT token
    const payload = {
      email: user.email,
      id: user._id,
    };

    if (await bcrypt.compare(password, user.password)) {
      let token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });

      // Remove password from the user object
      user.password = undefined;

      // Set cookie options
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Expires in 3 days
        httpOnly: true, // Make cookie HTTP-only
        secure: process.env.NODE_ENV === "production", // Only send cookie over HTTPS in production
        sameSite: "None", // Adjust sameSite attribute for cross-site requests
      };

      // Set the cookie
      res.cookie("Jaskaranstoken", token, options);

      // Send the token in response body for localStorage
      return res.status(200).json({
        success: true,
        token, // Send the token so it can be stored in localStorage
        user,
        message: "User logged in successfully!",
      });
    } else {
      return res.status(403).json({
        success: false,
        message: "Password is incorrect!",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Login failure!",
    });
  }
};
