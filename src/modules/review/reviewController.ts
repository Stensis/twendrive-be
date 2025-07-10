import { Response } from "express";
import { AuthenticatedRequest } from "src/types/express";
import * as reviewService from "./reviewService";

export const createReview = async (req: AuthenticatedRequest, res: Response) => {
  const { carId, rating, comment } = req.body;

  if (!carId || !rating || !comment) {
    return res.status(400).json({ message: "carId, rating and comment are required" });
  }

  try {
    const review = await reviewService.addReview({
      carId,
      rating,
      comment,
      userId: Number(req.user?.id),
    });
    res.status(201).json({ message: "Review posted", review });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getReviews = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reviews = await reviewService.getCarReviews(Number(req.params.carId));
    res.status(200).json({ reviews });
  } catch (err: any) {
    res.status(500).json({ message: "Failed to fetch reviews", error: err.message });
  }
};

export const replyToReview = async (req: AuthenticatedRequest, res: Response) => {
  const reviewId = Number(req.params.reviewId);
  const { reply } = req.body;

  if (!reply) {
    return res.status(400).json({ message: "Reply is required" });
  }

  try {
    const updated = await reviewService.replyToReview(reviewId, reply, Number(req.user?.id));
    res.status(200).json({ message: "Reply added", updated });
  } catch (err: any) {
    res.status(403).json({ message: err.message });
  }
};
