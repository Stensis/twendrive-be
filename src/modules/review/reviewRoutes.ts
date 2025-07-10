import { Router } from "express";
import * as reviewController from "./reviewController";
import authMiddleware from "src/middlewares/authMiddleware";
import roleMiddleware from "src/middlewares/roleMiddleware";

const router = Router();

// Renter: Post review
router.post("/renter", authMiddleware, roleMiddleware(["car_renter"]), reviewController.createReview);

// Owner: Reply to a review
router.post("/reply/:reviewId", authMiddleware, roleMiddleware(["car_owner"]), reviewController.replyToReview);

// Public: View car reviews
router.get("/:carId", reviewController.getReviews);

export default router;
