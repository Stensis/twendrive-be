import { Router } from "express";
import {
  addCar,
  adminUpdateCarStatus,
  deleteCar,
  getAllCars,
  getCarStatusCounts,
  getMyCars,
  updateCar,
} from "./carController";

import authMiddleware from "src/middlewares/authMiddleware";
import roleMiddleware from "src/middlewares/roleMiddleware";

const router: Router = Router();

// All users (admin, car_owner, car_renter) can view cars
router.get("/all", authMiddleware, getAllCars);

// Admin-only: Get car status breakdown
router.get(
  "/status_counts",
  authMiddleware,
  roleMiddleware(["admin"]),
  getCarStatusCounts
);

// Admin-only: Update any car's status
router.patch(
  "/:uuid/status",
  authMiddleware,
  roleMiddleware(["admin"]),
  adminUpdateCarStatus
);

// ✅ Car owners can manage their own cars
router.get(
  "/owner_cars",
  authMiddleware,
  roleMiddleware(["car_owner"]),
  getMyCars
);
router.post("/add-car", authMiddleware, roleMiddleware(["car_owner"]), addCar);
router.put("/:uuid", authMiddleware, roleMiddleware(["car_owner"]), updateCar);
router.delete(
  "/:uuid",
  authMiddleware,
  roleMiddleware(["car_owner"]),
  deleteCar
);

export default router;
