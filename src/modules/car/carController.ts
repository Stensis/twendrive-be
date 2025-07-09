import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "src/types/express";
import { CAR_STATUSES } from "src/constants/constants";

const prisma = new PrismaClient();

// ✅ Public: Get all active cars
export const getAllCars = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const isAdmin = req.user?.role === "admin";

    const cars = await prisma.car.findMany({
      where: isAdmin
        ? { deletedAt: null }
        : { deletedAt: null, status: "available" },
    });

    res.status(200).json({ cars });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Failed to fetch cars", error: err.message });
  }
};

// ✅ Car Owner: Get only your own cars
export const getMyCars = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const cars = await prisma.car.findMany({
      where: {
        ownerId: Number(req.user?.id),
        deletedAt: null,
      },
    });

    res.status(200).json({ cars });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Failed to fetch your cars", error: err.message });
  }
};

// ✅ Car Owner: Add a car
export const addCar = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const {
    name,
    image,
    price,
    location,
    description,
    lastInspection,
    inspectionStatus,
    inspectionImages,
    numberPlate,
    make,
    model,
    year,
    fuelType,
    mileage,
    features,
    status = "available", // default to available if not provided
  } = req.body;

  if (!CAR_STATUSES.includes(status)) {
    res
      .status(400)
      .json({
        message: `Invalid status. Must be one of: ${CAR_STATUSES.join(", ")}`,
      });
    return;
  }

  try {
    const car = await prisma.car.create({
      data: {
        name,
        image,
        price: parseFloat(price),
        location,
        description,
        lastInspection: lastInspection ? new Date(lastInspection) : null,
        inspectionStatus,
        inspectionImages,
        numberPlate,
        ownerId: Number(req.user?.id),
        make,
        model,
        year: Number(year),
        fuelType,
        mileage: Number(mileage),
        features,
        status,
      },
    });

    res.status(201).json({ message: "Car added", car });
  } catch (err: any) {
    res.status(500).json({ message: "Failed to add car", error: err.message });
  }
};

// ✅ Car Owner: Update only your car
export const updateCar = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { uuid } = req.params;
  const { status, ...updateData } = req.body;

  try {
    const car = await prisma.car.findUnique({ where: { uuid } });

    if (!car || car.ownerId !== Number(req.user?.id)) {
      res.status(403).json({ message: "Unauthorized or car not found" });
      return;
    }

    if (status && !CAR_STATUSES.includes(status)) {
      res
        .status(400)
        .json({
          message: `Invalid status. Must be one of: ${CAR_STATUSES.join(", ")}`,
        });
      return;
    }

    const updated = await prisma.car.update({
      where: { uuid },
      data: {
        ...updateData,
        ...(status && { status }),
      },
    });

    res.status(200).json({ message: "Car updated", updated });
  } catch (err: any) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

// ✅ Car Owner: Soft delete your car
export const deleteCar = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { uuid } = req.params;

  try {
    const car = await prisma.car.findUnique({ where: { uuid } });

    if (!car || car.ownerId !== Number(req.user?.id)) {
      res.status(403).json({ message: "Unauthorized or car not found" });
      return;
    }

    await prisma.car.update({
      where: { uuid },
      data: {
        deletedAt: new Date(),
        status: "deleted",
      },
    });

    res.status(200).json({ message: "Car soft-deleted" });
  } catch (err: any) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
};
// FOR ADMINS:
export const getCarStatusCounts = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const counts = await Promise.all(
      CAR_STATUSES.map(async (status) => {
        const count = await prisma.car.count({
          where: {
            status,
            deletedAt: null,
          },
        });
        return { status, count };
      })
    );

    const total = await prisma.car.count({
      where: {
        deletedAt: null,
      },
    });

    res.status(200).json({ total, counts });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to fetch car status counts', error: err.message });
  }
};

// ADMIN CAN UPDATEA CAR STATUS
export const adminUpdateCarStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { uuid } = req.params;
  const { status } = req.body;

  if (!CAR_STATUSES.includes(status)) {
    res.status(400).json({ message: `Invalid status. Must be one of: ${CAR_STATUSES.join(', ')}` });
    return;
  }

  try {
    const updated = await prisma.car.update({
      where: { uuid },
      data: {
        status,
      },
    });

    res.status(200).json({ message: 'Car status updated by admin', updated });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to update car status', error: err.message });
  }
};
