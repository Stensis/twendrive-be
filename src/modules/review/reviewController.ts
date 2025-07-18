import { Response } from "express";
import { AuthenticatedRequest } from "src/types/express";
import * as reviewService from "./reviewService";
import { canPostReview } from "@utils/rateLimiter";


export const createReview = async (req: AuthenticatedRequest, res: Response) => {
  const { carId, rating, comment } = req.body;

  if (!carId || !rating || !comment) {
    return res.status(400).json({ message: "carId, rating and comment are required" });
  }

  const userId = Number(req.user?.id);
  if (!canPostReview(userId)) {
    return res.status(429).json({ message: "You're posting too frequently. Please wait a moment." });
  }

  try {
    const review = await reviewService.addReview({
      carId,
      rating,
      comment,
      userId,
    });

    await reviewService.logAudit({
      userId,
      action: "create_review",
      metadata: { reviewId: review.id, carId },
    });

    res.status(201).json({ message: "Review posted", review });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getReviews = async (req: AuthenticatedRequest, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  try {
    const data = await reviewService.getCarReviews(Number(req.params.carId), page, limit);
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ message: "Failed to fetch reviews", error: err.message });
  }
};


export const replyToReview = async (req: AuthenticatedRequest, res: Response) => {
  const reviewId = Number(req.params.reviewId);
  const { reply } = req.body;

  if (!reply || reply.trim() === "") {
    return res.status(400).json({ message: "Reply is required." });
  }

  try {
    const updated = await reviewService.replyToReview(
      reviewId,
      reply.trim(),
      Number(req.user?.id)
    );

    return res.status(200).json({
      message: "Reply successfully added.",
      data: updated,
    });
  } catch (err: any) {
    return res.status(err.statusCode || 403).json({ message: err.message });
  }
};

