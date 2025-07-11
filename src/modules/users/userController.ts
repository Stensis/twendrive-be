import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "src/types/express";

const prisma = new PrismaClient();

// Get all users (Admin only)
// Get both active and disabled users
export const getAllUsers = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const activeUsers = await prisma.user.findMany({
      where: {
        deletedAt: null,
        disabled: false,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        disabled: true,
      },
    });

    const disabledUsers = await prisma.user.findMany({
      where: {
        deletedAt: null,
        disabled: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        disabled: true,
      },
    });

    res.status(200).json({
      activeUsers,
      disabledUsers,
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: err.message,
    });
  }
};

// Get single user
export const getUserById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ user });
  } catch (err: any) {
    res.status(500).json({ message: "Failed to get user", error: err.message });
  }
};

// Update user ADMIN ONLY
export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { firstName, lastName, phone } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { firstName, lastName, phone },
    });

    res.status(200).json({ message: "User updated", updatedUser });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Failed to update user", error: err.message });
  }
};

// Soft delete user ADMIN ONLY
export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.user.update({
      where: { id: Number(id) },
      data: {
        deletedAt: new Date(),
      },
    });

    res.status(200).json({ message: "User soft-deleted" });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Failed to delete user", error: err.message });
  }
};
