require("dotenv").config();
const jwt = require("jsonwebtoken");

exports.getCustomerItems = async (req, res) => {
  try {
    const token =
      req.cookies.Jaskaranstoken ||
      req.body.token ||
      req.headers["authorization"]?.split(" ")[1];
    console.log("token mil gaya hai --> ", token);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token Missing",
      });
    }
    // Verify the token
    try {
      const fetchedPayload = jwt.verify(token, process.env.JWT_SECRET);
      console.log(fetchedPayload);

      // Store the payload in req.user
      req.user = fetchedPayload;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid",
      });
    }
  } catch (error) {
    console.error("Error while verifying token:", error);
    return res.status(400).json({
      success: false,
      message: "Something went wrong while verifying the token",
    });
  }
};
