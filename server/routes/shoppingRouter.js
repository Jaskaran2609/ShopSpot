const express = require("express");
const router = express.Router();
require("dotenv").config();
const User = require("../models/userSchema");

// Import controllers
const { login, signup, verifyOtp } = require("../controllers/auth");
const { createItem, getAllItems } = require("../controllers/itemController");
const { purchaseItem } = require("../controllers/purchaseitem");
const { capturePayment, verifySignature } = require("../controllers/Payment");
const { auth } = require("../middleware/authmiddleware");
const { getCustomerItems } = require("../controllers/getCustomerItems");

// Define routes with proper handlers
router.post("/login", login);
router.post("/signup", signup);
router.post("/createitem", createItem);
router.get("/allitems", getAllItems);
router.post("/verify-otp", verifyOtp); // Changed to POST for consistency
router.post("/purchaseitem", purchaseItem);
router.post("/capturepayment", capturePayment);
router.post("/verifysignature", verifySignature);
router.get("/getcustomeritems", getCustomerItems);

// Test route with authentication middleware
router.get("/test", auth, async (req, res) => {
  try {
    const user = req.user; // Access the user payload from the middleware

    // Fetch the user's items purchased
    const userDetails = await User.findById(user.id).populate("itemsPurchased");

    res.json({
      success: true,
      message: "Welcome to the protected route",
      data: userDetails.itemsPurchased,
    });
  } catch (error) {
    console.error("Error while fetching user details:", error);
    res.status(500).json({
      success: false,
      message: "Error while fetching user details",
    });
  }
});

module.exports = router;
