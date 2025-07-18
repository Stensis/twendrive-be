import { Request, Response } from 'express';
import { AuthenticatedRequest } from 'src/types/express';
import * as bookingService from './bookingService';
import { ALLOWED_STATUSES } from 'src/constants/constants';
import prisma from 'src/config/database';

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
// ANALYTICS FOR ADMIN & OWNERS
export const getMonthlyEarnings = async (req: AuthenticatedRequest, res: Response) => {
  const isAdmin = req.user?.role === 'admin';
  const userId = req.user!.id;

  try {
    const payments = await prisma.payment.findMany({
      where: isAdmin
        ? { status: 'success' }
        : {
            status: 'success',
            booking: {
              ownerId: userId,
            },
          },
      include: {
        booking: true,
      },
    });

    const monthlyTotals: Record<string, number> = {};

    for (const payment of payments) {
      const monthKey = payment.createdAt.toISOString().substring(0, 7); // e.g. 2025-07
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + payment.ownerAmount;
    }

    res.status(200).json({ monthlyTotals });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to get earnings', error: err.message });
  }
};
