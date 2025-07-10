import { Response } from 'express';
import { AuthenticatedRequest } from 'src/types/express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ✅ Create a payment for a booking
export const createPayment = async (req: AuthenticatedRequest, res: Response) => {
  const bookingId = Number(req.params.bookingId);
  const { method, amount } = req.body;

  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

    if (!booking || booking.renterId !== req.user?.id) {
      return res.status(403).json({ message: 'Booking not found or not yours' });
    }

    const platformFee = amount * 0.1;
    const ownerAmount = amount * 0.9;

    const payment = await prisma.payment.create({
      data: {
        method,
        amount,
        platformFee,
        ownerAmount,
        status: 'success', // simulate success for now
        bookingId: booking.id,
      },
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'confirmed',
      },
    });

    res.status(201).json({ message: 'Payment successful', payment });
  } catch (err: any) {
    res.status(500).json({ message: 'Payment failed', error: err.message });
  }
};

// ✅ Admin: View all payments
export const getAllPayments = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        booking: {
          include: {
            car: true,
            renter: true,
            owner: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ payments });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to fetch payments', error: err.message });
  }
};

// ✅ Renter: View their payments
export const getMyPayments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        booking: {
          renterId: req.user!.id,
        },
      },
      include: {
        booking: {
          include: { car: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ payments });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to fetch your payments', error: err.message });
  }
};
