import { Router } from "express";
import * as reviewController from "./reviewController";
import authMiddleware from "src/middlewares/authMiddleware";
import roleMiddleware from "src/middlewares/roleMiddleware";

const router = Router();

// Renter posts a review for a car they booked
router.post(
  "/renter",
  authMiddleware,
  roleMiddleware(["car_renter"]),
  reviewController.createReview
);

// Car owner replies to a review
router.post(
  "/reply/:reviewId",
  authMiddleware,
  roleMiddleware(["car_owner"]),
  reviewController.replyToReview
);

// Public: Get all reviews for a specific car
router.get("/:carId", reviewController.getReviews);

export default router;
