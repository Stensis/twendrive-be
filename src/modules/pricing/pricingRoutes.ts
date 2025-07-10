// src/modules/pricing/pricingRoutes.ts
import { Router } from "express";
import * as pricingController from "./pricingController";
import authMiddleware from "src/middlewares/authMiddleware";
import roleMiddleware from "src/middlewares/roleMiddleware";

const router = Router();

// Only admin or car owner can set/update pricing
router.post("/", authMiddleware, roleMiddleware(["admin", "car_owner"]), pricingController.updatePricing);

// Anyone can fetch pricing for a car
router.get("/:carId", pricingController.getPricing);

export default router;
