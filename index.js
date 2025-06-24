const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser"); // ADD THIS
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();
app.use(cors({
  origin: "*", // or your frontend URL
  credentials: true               // allow sending cookies
}));
app.use(express.json());
app.use(cookieParser()); // ADD THIS

// Routes
app.use("/api/auth", authRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
