import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const setOrUpdatePricing = async ({
  carId,
  ratePerDay,
  discount = 0,
}: {
  carId: number;
  ratePerDay: number;
  discount?: number;
}) => {
  const existing = await prisma.pricing.findFirst({
    where: { carId },
  });

  if (existing) {
    return await prisma.pricing.update({
      where: { id: existing.id },
      data: { ratePerDay, discount },
    });
  }

  return await prisma.pricing.create({
    data: { carId, ratePerDay, discount },
  });
};

export const getCarPricing = async (carId: number) => {
  return await prisma.pricing.findFirst({
    where: { carId },
  });
};
