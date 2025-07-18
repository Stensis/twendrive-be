import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createBooking = async (
  renterId: number,
  carId: number,
  startDate: string,
  endDate: string,
  agreement: string
) => {
  const car = await prisma.car.findUnique({ where: { id: carId } });
  if (!car) throw new Error("Car not found");
  if (car.status !== "available") throw new Error("Car not available");

  const parsedStart = new Date(startDate);
  const parsedEnd = new Date(endDate);

  if (parsedEnd <= parsedStart) throw new Error("Invalid date range");

  // 🚫 Conflict Check (existing availability)
  const overlapping = await prisma.availability.findFirst({
    where: {
      carId,
      status: "occupied",
      OR: [
        {
          startDate: { lte: parsedEnd },
          endDate: { gte: parsedStart },
        },
      ],
    },
  });

  if (overlapping) throw new Error("Car already booked for these dates");

  // ✅ Create booking
  const booking = await prisma.booking.create({
    data: {
      carId,
      renterId,
      ownerId: car.ownerId,
      startDate: parsedStart,
      endDate: parsedEnd,
      agreement,
      status: "pending",
    },
  });

  // ✅ Mark availability (pre-occupied)
  await prisma.availability.create({
    data: {
      carId,
      userId: renterId,
      startDate: parsedStart,
      endDate: parsedEnd,
      status: "occupied",
    },
  });

  return booking;
};

export const getBookingsByRenter = async (renterId: number) => {
  const bookings = await prisma.booking.findMany({
    where: { renterId },
    include: { car: true, payment: true },
    orderBy: { createdAt: "desc" },
  });

  return bookings;
};

export const getBookingsByOwner = async (ownerId: number) => {
  const bookings = await prisma.booking.findMany({
    where: { ownerId },
    include: { car: true, renter: true, payment: true },
    orderBy: { createdAt: "desc" },
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

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { car: true },
  });

  if (!booking || booking.ownerId !== ownerId) throw new Error('Unauthorized');

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  });

  // 💰 Payment record (on confirmed)
  if (status === 'confirmed' && !booking.car.deletedAt) {
    const durationInDays =
      (booking.endDate.getTime() - booking.startDate.getTime()) /
      (1000 * 60 * 60 * 24);

    const amount = booking.car.price * durationInDays;
    const platformFee = amount * 0.1;
    const ownerAmount = amount - platformFee;

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        method: 'M-Pesa', // or use actual method from frontend
        amount,
        platformFee,
        ownerAmount,
        status: 'success',
      },
    });

    // ⏫ Update car bookings and earnings
    await prisma.car.update({
      where: { id: booking.carId },
      data: {
        bookings: { increment: 1 },
        totalEarnings: { increment: ownerAmount },
      },
    });
  }

  return updated;
};

// OPTIONAL: FILTER BOOKINGS BY STATUS OR DATE
export const filterBookings = async (userId: number, role: 'renter' | 'owner', status?: string) => {
  const whereClause: any = {
    [role === 'renter' ? 'renterId' : 'ownerId']: userId,
    ...(status && { status }),
  };

  return await prisma.booking.findMany({
    where: whereClause,
    include: { car: true },
    orderBy: { createdAt: 'desc' },
  });
};
