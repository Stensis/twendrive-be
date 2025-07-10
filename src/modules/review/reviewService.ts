import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Add review if renter has completed booking & hasn't reviewed yet
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
    where: {
      carId,
      renterId: userId,
      status: "completed",
    },
  });

  if (!booking) throw new Error("You can only review cars you've completed bookings for");

  const existing = await prisma.carReview.findFirst({
    where: { carId, userId },
  });

  if (existing) throw new Error("You have already reviewed this car");

  const review = await prisma.carReview.create({
    data: { carId, userId, rating, comment },
  });

  // Recalculate average rating for car
  const agg = await prisma.carReview.aggregate({
    where: { carId },
    _avg: { rating: true },
  });

  await prisma.car.update({
    where: { id: carId },
    data: { rating: agg._avg.rating || 0 },
  });

  return review;
};

// Allow owner to reply
export const replyToReview = async (reviewId: number, reply: string, ownerId: number) => {
  const review = await prisma.carReview.findUnique({
    where: { id: reviewId },
    include: { car: true },
  });

  if (!review) throw new Error("Review not found");
  if (review.car.ownerId !== ownerId) throw new Error("Only car owner can reply");

  return await prisma.carReview.update({
    where: { id: reviewId },
    data: { reply },
  });
};

// Get all reviews for a car
export const getCarReviews = async (carId: number) => {
  return await prisma.carReview.findMany({
    where: { carId },
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};
