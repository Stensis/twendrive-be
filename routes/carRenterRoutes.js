const express = require("express");
const router = express.Router();
const {
  carRenterDashboard,
} = require("../controllers/car_renter/carRenterController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(authMiddleware, roleMiddleware(["car_renter"]));

router.get("/dashboard", carRenterDashboard);

module.exports = router;
