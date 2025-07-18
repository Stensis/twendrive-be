import { Router } from "express";
import {
  createBooking,
  getMonthlyEarnings,
  getMyBookings,
  getOwnerBookings,
  updateBookingStatus,
} from "./bookingController";
import authMiddleware from "src/middlewares/authMiddleware";
import roleMiddleware from "src/middlewares/roleMiddleware";

const router = Router();

// Renter creates booking
router.post(
  "/:carId",
  authMiddleware,
  roleMiddleware(["car_renter"]),
  createBooking
);

// Renter sees their bookings
router.get(
  "/my",
  authMiddleware,
  roleMiddleware(["car_renter"]),
  getMyBookings
);

// Car owner sees bookings on their cars
router.get(
  "/owner",
  authMiddleware,
  roleMiddleware(["car_owner"]),
  getOwnerBookings
);

// Owner can update status (confirmed, cancelled, etc.)
router.put(
  "/:bookingId/status",
  authMiddleware,
  roleMiddleware(["car_owner"]),
  updateBookingStatus
);

// Admin + Owner analytics
router.get(
  "/analytics/monthly-earnings",
  authMiddleware,
  roleMiddleware(["admin", "car_owner"]),
  getMonthlyEarnings
);

export default router;
