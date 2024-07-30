const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

const bodyParser = require("body-parser");

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); // Use cookie-parser middleware

// Import and use the router
const router = require("./routes/shoppingRouter");
app.use("/shoppingwebsite", router);

// Database connection
const connectWithDb = require("./config/database");
connectWithDb();

// Start the server
app.listen(PORT, () => {
  console.log(`SERVER STARTED AT PORT NUMBER ${PORT}`);
});
