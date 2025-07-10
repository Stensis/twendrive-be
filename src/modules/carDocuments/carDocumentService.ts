import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const uploadDocument = async ({
  carId,
  title,
  type,
  url,
  userId,
}: {
  carId: number;
  title: string;
  type: string;
  url: string;
  userId: number;
}) => {
  const car = await prisma.car.findUnique({ where: { id: carId } });

  if (!car || car.ownerId !== userId) {
    throw new Error('Car not found or unauthorized');
  }

  const document = await prisma.carDocument.create({
    data: {
      carId,
      title,
      type,
      url,
    },
  });

  return { message: 'Document uploaded', document };
};

export const getDocuments = async (carId: number) => {
  const documents = await prisma.carDocument.findMany({
    where: { carId },
  });

  return { documents };
};

export const deleteDocument = async (documentId: number) => {
  await prisma.carDocument.delete({
    where: { id: documentId },
  });

  return { message: 'Document deleted' };
};
