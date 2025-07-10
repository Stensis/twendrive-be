// src/modules/availability/availabilityRoutes.ts
import { Router } from "express";
import * as availabilityController from "./availabilityController";
import authMiddleware from "src/middlewares/authMiddleware";
import roleMiddleware from "src/middlewares/roleMiddleware";

const router = Router();

// Only car owners can add or cancel availability
router.post(
  "/:carId",
  authMiddleware,
  roleMiddleware(["car_owner"]),
  availabilityController.addAvailability
);

router.put(
  "/:id/status",
  authMiddleware,
  roleMiddleware(["car_owner"]),
  availabilityController.updateAvailabilityStatus
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["car_owner"]),
  availabilityController.cancelAvailability
);

// Public: Anyone can view a car's availability
router.get("/:carId", availabilityController.listAvailability);

export default router;
