import { Response } from "express";

export const successResponse = (
  res: Response,
  data: any,
  message = "Success"
): void => {
  res.status(200).json({ success: true, message, data });
};

export const errorResponse = (
  res: Response,
  message = "Something went wrong",
  status = 500
): void => {
  res.status(status).json({ success: false, message });
};
