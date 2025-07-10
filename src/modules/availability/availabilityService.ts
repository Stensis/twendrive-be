// src/modules/availability/availabilityService.ts
import { PrismaClient } from "@prisma/client";
import { AVAILABILITY_STATUSES } from "src/constants/constants";

const prisma = new PrismaClient();

export const createAvailability = async (
  carId: number,
  startDate: Date,
  endDate: Date,
  status: string = "available"
) => {
  if (!AVAILABILITY_STATUSES.includes(status)) {
    throw new Error("Invalid availability status");
  }

  return await prisma.availability.create({
    data: {
      carId,
      startDate,
      endDate,
      status,
    },
  });
};

export const getCarAvailability = async (carId: number) => {
  return await prisma.availability.findMany({
    where: {
      carId,
    },
    orderBy: {
      startDate: "asc",
    },
    include: {
      car: {
        select: {
          id: true,
          ownerId: true,
        },
      },
      user: {
        select: {
          userName: true,
        },
      },
    },
  });
};

export const cancelAvailability = async (
  availabilityId: number,
  userId: number
) => {
  const availability = await prisma.availability.findUnique({
    where: { id: availabilityId },
    include: { car: true },
  });

  if (!availability || availability.car.ownerId !== userId) {
    throw new Error("Unauthorized or record not found");
  }

  const updated = await prisma.availability.update({
    where: { id: availabilityId },
    data: { status: "canceled" },
    include: {
      car: {
        select: {
          id: true,
          ownerId: true,
        },
      },
    },
  });

  return updated; // will include `car.ownerId`
};
