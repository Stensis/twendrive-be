const express = require("express");
const router = express.Router();
const {
  getCars,
  addCar,
  updateCar,
  deleteCar,
} = require("../controllers/car_owner/carOwnerController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(authMiddleware, roleMiddleware(["car_owner"]));

router.get("/cars", getCars);
router.post("/cars", addCar);
router.put("/cars/:uuid", updateCar);
router.delete("/cars/:uuid", deleteCar);

module.exports = router;
