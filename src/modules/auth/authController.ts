import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

import { AuthenticatedRequest, JwtPayload } from "src/types/express";
import { USER_ROLES } from "src/constants/roles";
import { errorResponse, successResponse } from "src/utils/response";
import { generateToken } from "src/utils/token";
import { refreshTokenCookieOptions } from "src/config/cookies";

const prisma = new PrismaClient();

// Register user
export const register = async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, email, phone, password, role } = req.body;

  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      errorResponse(res, "User already exists", 400);
      return;
    }

    if (!USER_ROLES.includes(role)) {
      errorResponse(res, "Invalid role", 400);
      return;
    }

    if (role === "admin") {
      if (
        email !== process.env.ADMIN_EMAIL ||
        password !== process.env.ADMIN_PASSWORD
      ) {
        errorResponse(
          res,
          "You are not authorized to create an admin account",
          403
        );
        return;
      }
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        role,
      },
    });

    successResponse(
      res,
      {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      "User registered successfully"
    );
  } catch (err: any) {
    errorResponse(res, "Registration failed", 500);
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password, role } = req.body;

  if (!email || !password || !role || role.trim() === "") {
    errorResponse(res, "Email, password, and role are required", 400);
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      errorResponse(res, "Invalid credentials", 400);
      return;
    }
    // THE DISABLED USERS CANT LOG IN
    if (user.disabled) {
      errorResponse(res, "Your account has been disabled", 403);
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      errorResponse(res, "Invalid credentials", 400);
      return;
    }

    if (user.role !== role) {
      errorResponse(
        res,
        `Unauthorized: expected role '${user.role}', but received '${role}'`,
        403
      );
      return;
    }

    const accessToken = generateToken(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      "1h"
    );

    const refreshToken = generateToken(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_REFRESH_SECRET!,
      "7d"
    );

    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

    successResponse(
      res,
      {
        accessToken,
        user: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
        },
      },
      "Login successful"
    );
  } catch (err: any) {
    errorResponse(res, "Login failed", 500);
  }
};

// Refresh token
export const refresh = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    errorResponse(res, "No refresh token provided", 401);
    return;
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as JwtPayload;

    const newAccessToken = generateToken(
      { id: decoded.id, email: decoded.email, role: decoded.role },
      process.env.JWT_SECRET!,
      "15m"
    );

    successResponse(res, { accessToken: newAccessToken }, "Token refreshed");
  } catch {
    errorResponse(res, "Invalid or expired refresh token", 403);
  }
};

// Logout user
export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie("refreshToken", refreshTokenCookieOptions);
  successResponse(res, null, "Logged out successfully");
};

// Get logged-in user's profile
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  successResponse(res, { user: req.user }, "User profile");
};
