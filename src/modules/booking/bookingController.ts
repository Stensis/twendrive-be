import { Request, Response } from 'express';
import { AuthenticatedRequest } from 'src/types/express';
import * as bookingService from './bookingService';
import { ALLOWED_STATUSES } from 'src/constants/constants';

export const createBooking = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const carId = Number(req.params.carId);
    const { startDate, endDate, agreement } = req.body;

    const booking = await bookingService.createBooking(req.user!.id, carId, startDate, endDate, agreement);
    res.status(201).json({ message: 'Booking created', booking });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to create booking', error: err.message });
  }
};

export const getMyBookings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await bookingService.getBookingsByRenter(req.user!.id);
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to get bookings', error: err.message });
  }
};

export const getOwnerBookings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await bookingService.getBookingsByOwner(req.user!.id);
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to get bookings', error: err.message });
  }
};

export const updateBookingStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bookingId = Number(req.params.bookingId);
    const { status } = req.body;

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Failed to update status",
        error: "Invalid status. Allowed: " + ALLOWED_STATUSES.join(', ')
      });
    }

    const result = await bookingService.updateBookingStatus(bookingId, req.user!.id, status);
    res.status(200).json({ message: 'Status updated', result });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to update status', error: err.message });
  }
};