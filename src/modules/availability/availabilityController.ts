// src/modules/availability/availabilityController.ts
import { Request, Response } from "express";
import { AuthenticatedRequest } from "src/types/express";
import * as availabilityService from "./availabilityService";
import { AVAILABILITY_STATUSES } from "src/constants/constants";
import prisma from "src/config/database";

export const addAvailability = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { carId, startDate, endDate, status = "available" } = req.body;

  if (!carId || !startDate || !endDate) {
    res.status(400).json({ message: "Missing fields" });
    return;
  }

  if (!AVAILABILITY_STATUSES.includes(status)) {
    res.status(400).json({ message: "Invalid availability status" });
    return;
  }

  try {
    const availability = await availabilityService.createAvailability(
      carId,
      new Date(startDate),
      new Date(endDate),
      status
    );
    res.status(201).json({ message: "Availability created", availability });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to create", error: error.message });
  }
};


export const listAvailability = async (req: Request, res: Response) => {
  const carId = Number(req.params.carId);
  try {
    const availability = await availabilityService.getCarAvailability(carId);
    res.status(200).json({ availability });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch", error: error.message });
  }
};

// availabilityController.ts
export const updateAvailabilityStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  if (!AVAILABILITY_STATUSES.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const updated = await prisma.availability.update({
      where: { id },
      data: { status },
    });
    res.status(200).json({ message: "Status updated", updated });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to update status", error: error.message });
  }
};


export const cancelAvailability = async (req: AuthenticatedRequest, res: Response) => {
  const id = Number(req.params.id);

  try {
    const cancelled = await availabilityService.cancelAvailability(id, Number(req.user?.id));
    res.status(200).json({ message: "Availability canceled", cancelled });
  } catch (error: any) {
    res.status(403).json({ message: error.message });
  }
};

