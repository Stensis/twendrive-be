import { Response } from "express";

export const successResponse = (
  res: Response,
  data?: any,
  message = "Success"
): void => {
  const response: any = {
    success: true,
    message,
  };

  if (data !== undefined && data !== null) {
    response.data = data;
  }

  res.status(200).json(response);
};

export const errorResponse = (
  res: Response,
  message = "Something went wrong",
  status = 500
): void => {
  res.status(status).json({ success: false, message });
};
