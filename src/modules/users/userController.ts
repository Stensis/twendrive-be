import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "src/types/express";
import multer from "multer";
import { storage } from "@middlewares/upload";

const prisma = new PrismaClient();
const upload = multer({ storage });

export const userSelectFields = {
  id: true,
  uuid: true,
  firstName: true,
  lastName: true,
  userName: true,
  email: true,
  emailVerified: true,
  phone: true,
  role: true,
  avatar: true,
  location: true,
  createdAt: true,
  disabled: true,
  password: true,
};

// Get the authenticated user's details
export const getMe = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: userSelectFields,
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ success: true, user });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Failed to fetch user profile", error: err.message });
  }
};

// Update authenticated user's profile
export const updateMyProfile = [
  upload.single('avatar'), // 👈 multer handles the file
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { firstName, lastName, phone, userName, email, location, avatarUrl } = req.body;

    const avatar = req.file
      ? `/uploads/avatars/${req.file.filename}` // 👈 if a file was uploaded
      : avatarUrl || undefined;                // 👈 if using a URL instead

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName,
          lastName,
          userName,
          email,
          phone,
          location,
          avatar, // ✅ just save as string
        },
        select: {
          ...userSelectFields,
          password: false,
        },
      });

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: "Failed to update profile",
        error: err.message,
      });
    }
  },
];

// Get all users (Admin only)
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
      select: userSelectFields,
    });

    const disabledUsers = await prisma.user.findMany({
      where: {
        deletedAt: null,
        disabled: true,
      },
      select: userSelectFields,
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
      select: userSelectFields,
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
