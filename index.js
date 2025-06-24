const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const carOwnerRoutes = require("./routes/carOwnerRoutes"); 
const carRenterRoutes = require("./routes/carRenterRoutes");
const deleteExpiredUsers = require("./cronJobs/users/deleteUsersJob");

dotenv.config();
const app = express();

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Main routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/owner", carOwnerRoutes);
app.use("/api/renter", carRenterRoutes);

// Start scheduled tasks
deleteExpiredUsers.start();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
