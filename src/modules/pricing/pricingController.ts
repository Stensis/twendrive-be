// src/modules/pricing/pricingController.ts
import { Response } from "express";
import { AuthenticatedRequest } from "src/types/express";
import * as pricingService from "./pricingService";

export const updatePricing = async (req: AuthenticatedRequest, res: Response) => {
  const { carId, ratePerDay, discount } = req.body;

  if (!carId || !ratePerDay) {
    res.status(400).json({ message: "carId and ratePerDay are required" });
    return;
  }

  try {
    const pricing = await pricingService.setOrUpdatePricing({
      carId: Number(carId),
      ratePerDay: parseFloat(ratePerDay),
      discount: discount ? parseFloat(discount) : 0,
    });

    res.status(200).json({ message: "Pricing updated", pricing });
  } catch (err: any) {
    res.status(500).json({ message: "Failed to update pricing", error: err.message });
  }
};

export const getPricing = async (req: AuthenticatedRequest, res: Response) => {
  const carId = Number(req.params.carId);

  try {
    const pricing = await pricingService.getCarPricing(carId);
    if (!pricing) {
      res.status(404).json({ message: "No pricing info found" });
      return;
    }
    res.status(200).json({ pricing });
  } catch (err: any) {
    res.status(500).json({ message: "Failed to fetch pricing", error: err.message });
  }
};
