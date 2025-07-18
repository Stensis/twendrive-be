import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const addReview = async ({
  carId,
  userId,
  rating,
  comment,
}: {
  carId: number;
  userId: number;
  rating: number;
  comment: string;
}) => {
  const booking = await prisma.booking.findFirst({
    where: { carId, renterId: userId, status: "completed" },
  });

  if (!booking) {
    throw new Error("You can only review cars you've completed bookings for.");
  }

  const existingReview = await prisma.carReview.findFirst({
    where: { carId, userId },
  });

  if (existingReview) {
    throw new Error("You have already submitted a review for this car.");
  }

  const review = await prisma.carReview.create({
    data: { carId, userId, rating, comment },
  });

  // Update average rating
  const { _avg } = await prisma.carReview.aggregate({
    where: { carId },
    _avg: { rating: true },
  });

  await prisma.car.update({
    where: { id: carId },
    data: { rating: _avg.rating || 0 },
  });

  return review;
};

export const replyToReview = async (
  reviewId: number,
  reply: string,
  ownerId: number
) => {
  const review = await prisma.carReview.findUnique({
    where: { id: reviewId },
    include: { car: true },
  });

  if (!review) throw new Error("Review not found.");
  if (review.car.ownerId !== ownerId)
    throw new Error("Only the car owner can reply to this review.");

  return prisma.carReview.update({
    where: { id: reviewId },
    data: { reply },
  });
};

export const getCarReviews = async (carId: number, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.carReview.findMany({
      where: { carId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.carReview.count({ where: { carId } }),
  ]);

  return {
    reviews,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};
export function logAudit(arg0: { userId: number; action: string; metadata: { reviewId: any; carId: any; }; }) {
  throw new Error("Function not implemented.");
}

