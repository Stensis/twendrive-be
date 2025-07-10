import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createBooking = async (
  renterId: number,
  carId: number,
  startDate: string,
  endDate: string,
  agreement: string
) => {
  const car = await prisma.car.findUnique({ where: { id: carId } });
  if (!car) throw new Error('Car not found');

  // Optional: Check availability

  const booking = await prisma.booking.create({
    data: {
      carId,
      renterId,
      ownerId: car.ownerId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      agreement,
      status: 'pending',
    },
  });

  return booking;
};

export const getBookingsByRenter = async (renterId: number) => {
  const bookings = await prisma.booking.findMany({
    where: { renterId },
    include: { car: true, payment: true },
    orderBy: { createdAt: 'desc' },
  });

  return bookings;
};

export const getBookingsByOwner = async (ownerId: number) => {
  const bookings = await prisma.booking.findMany({
    where: { ownerId },
    include: { car: true, renter: true, payment: true },
    orderBy: { createdAt: 'desc' },
  });

  return bookings;
};

export const updateBookingStatus = async (
  bookingId: number,
  ownerId: number,
  status: string
) => {
  const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) throw new Error('Invalid status');

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.ownerId !== ownerId) throw new Error('Unauthorized');

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  });

  return updated;
};
