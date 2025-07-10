import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const sendNotification = async (userId: number, title: string, message: string) => {
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
    },
  });
};

export const getUserNotifications = async (userId: number) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

export const markNotificationRead = async (id: number, userId: number) => {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== userId) {
    throw new Error('Not allowed');
  }

  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
};
