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
app.use(
  cors({
    origin: "https://gentle-salamander-b1fd67.netlify.app", // Adjust based on your actual origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // Allow credentials (cookies, etc.)
  })
);
app.use(bodyParser.json());
// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); // Use cookie-parser middleware

// Import and use the router
const router = require("./routes/shoppingRouter");
app.use("/shoppingwebsite", router);
app.get("/", (req, res) => {
  res.send("Hello");
});

// Database connection
const connectWithDb = require("./config/database");
connectWithDb();

// Start the server
app.listen(PORT, () => {
  console.log(`SERVER STARTED AT PORT NUMBER ${PORT}`);
});
