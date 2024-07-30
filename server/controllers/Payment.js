const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/userSchema");
const Item = require("../models/itemSchema");

let emailihave;
let cartihave;

// Initialize Razorpay instance
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const capturePayment = async (req, res) => {
  console.log("Capture Payment Route Hit");
  const { cart, email } = req.body;
  emailihave = email;
  cartihave = cart;
  console.log("The email I got is ", email);

  try {
    // Calculate the total amount for the cart
    let amount = 0;
    for (const itemId of cart) {
      const item = await Item.findById(itemId);
      if (item) {
        amount += Math.round(parseFloat(item.price) * 100); // Convert price to paise and round to nearest integer
      }
    }

    const currency = "INR";
    const options = {
      amount, // Amount in paise
      currency,
      receipt: `receipt_${Math.random().toString(36).substring(7)}`,
      notes: {
        cart: JSON.stringify(cart),
        email,
      },
    };

    // Initiate the payment using Razorpay
    const paymentResponse = await instance.orders.create(options);

    // Return the response
    return res.status(200).json({
      success: true,
      orderId: paymentResponse.id,
      currency: paymentResponse.currency,
      amount: paymentResponse.amount,
    });
  } catch (error) {
    console.log("Error initiating payment:", error);
    return res.status(500).json({
      success: false,
      message: "Could not initiate order",
    });
  }
};

const verifySignature = async (req, res) => {
  console.log("Verify Signature Route Hit");
  console.log("Request Body:", req.body); // Log raw body
  console.log("Headers:", req.headers); // Log headers

  // Temporarily skipping signature verification
  console.log("Skipping signature verification for troubleshooting");

  try {
    // Check if the payload is properly structured

    // const notes = JSON.parse(req.body.payload.payment.entity.notes);
    const email = emailihave;
    const cart = cartihave;

    if (!cart || !email) {
      throw new Error("Cart or email is missing in notes");
    }

    const user = await User.findOne({ email }).populate("itemsPurchased");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await Item.updateMany(
      { _id: { $in: cart } },
      { $set: { purchasedby: user._id } }
    );

    user.itemsPurchased.push(...cart);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Payment and purchase successful",
    });
  } catch (error) {
    console.error("Error while processing purchase:", error);
    return res.status(500).json({
      success: false,
      message: "Error while processing purchase",
    });
  }
};

module.exports = { capturePayment, verifySignature };
