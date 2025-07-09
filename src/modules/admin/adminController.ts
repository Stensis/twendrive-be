import { Response, Request } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all active users
export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        disabled:true,
        createdAt: true,
      },
    });

    res.status(200).json({ users });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

// Disable a user (suspend access)
export const disableUser = async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.id);

  if (isNaN(userId)) {
    res.status(400).json({ message: 'Invalid user ID' });
    return;
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { disabled: true },
    });

    res.status(200).json({ message: `User '${user.email}' has been disabled.` });
  } catch (err: any) {
    res.status(500).json({ message: 'Disable failed', error: err.message });
  }
};

// Enable a user (restore access)
export const enableUser = async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.id);

  if (isNaN(userId)) {
    res.status(400).json({ message: 'Invalid user ID' });
    return;
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { disabled: false },
    });

    res.status(200).json({ message: `User '${user.email}' has been enabled.` });
  } catch (err: any) {
    res.status(500).json({ message: 'Enable failed', error: err.message });
  }
};

// Soft delete user (mark for deletion after 30 days)
export const softDeleteUser = async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.id);

  if (isNaN(userId)) {
    res.status(400).json({ message: 'Invalid user ID' });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        deleteAfter: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days later
      },
    });

    res.status(200).json({
      message: `User '${user.email}' marked for deletion in 30 days.`,
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};
