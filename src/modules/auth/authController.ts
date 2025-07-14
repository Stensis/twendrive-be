import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

import {
  AuthenticatedRequest,
  JwtPayload,
  SelectedUser,
} from "src/types/express";
import { USER_ROLES } from "src/constants/roles";
import { errorResponse, successResponse } from "src/utils/response";
import { generateToken } from "src/utils/token";
import { refreshTokenCookieOptions } from "src/config/cookies";
import { sendEmailOTP, verifyOTP } from "@utils/otp";

import { registerSchema } from "@utils/validators";
import { sendMail, sendVerificationEmail } from "@utils/mailer";
import { generateVerificationToken } from "@utils/emailVerification";
import { userSelectFields } from "@modules/users/userController";

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response): Promise<void> => {
  const {
    firstName,
    lastName,
    userName,
    email,
    phone,
    password,
    confirmPassword,
    role,
  } = req.body;

  try {
    // ✅ Validate user input
    await registerSchema.validate(req.body);

    if (!USER_ROLES.includes(role)) {
      return errorResponse(res, "Invalid role", 400);
    }

    if (password !== confirmPassword) {
      return errorResponse(res, "Password Mismatch", 400);
    }

    // ✅ Check for existing user
    const userExists = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (userExists) return errorResponse(res, "User already exists", 400);

    // ✅ Admin verification
    if (role === "admin") {
      if (
        email !== process.env.ADMIN_EMAIL ||
        password !== process.env.ADMIN_PASSWORD
      ) {
        return errorResponse(res, "Unauthorized to register admin", 403);
      }
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user with emailVerified false
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        userName,
        email,
        phone,
        password: hashedPassword,
        role,
        emailVerified: role === "admin" ? true : false, // auto verify admin
      } as any,
    });

    // ✅ Send verification email if not admin

    if (role !== "admin") {
      const token = generateVerificationToken(email);
      await sendVerificationEmail(email, token, firstName || userName);
    }

    return successResponse(
      res,
      {
        id: user.id,
        email: user.email,
        emailVerified: (user as any).emailVerified,
        message:
          role === "admin"
            ? "Admin registered successfully"
            : "User registered successfully. Please check your email to verify your account.",
      },
      "User registered"
    );
  } catch (err: any) {
    console.error("Register Error:", err);
    return errorResponse(res, err.message || "Registration failed", 500);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { identifier, password, role, otp } = req.body;

  try {
    const user = (await prisma.user.findFirst({
      where: {
        OR: [{ userName: identifier }, { email: identifier }],
      },
      select: userSelectFields,
    })) as SelectedUser;

    if (!user) {
      return errorResponse(res, "Invalid credentials", 400);
    }

    if (user.disabled) {
      return errorResponse(res, "Your account has been disabled", 403);
    }

    if (!user.password) {
      return errorResponse(res, "Missing credentials", 400);
    }
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return errorResponse(res, "Invalid credentials", 400);
    }

    if (user.role !== role) {
      return errorResponse(
        res,
        `Unauthorized: expected role '${user.role}'`,
        403
      );
    }

    // 🛑 Require email verification for non-admin users
    if (user.role !== "admin" && !user.emailVerified) {
      return errorResponse(
        res,
        "Please verify your email before logging in.",
        403
      );
    }

    // 🛑 Skip OTP for admin
    const requiresOTP = role !== "admin";
    if (requiresOTP) {
      if (!otp) {
        await sendEmailOTP(user.id, user.email);
        res.status(401).json({
          status: "otp-required",
          message: "OTP sent to your email. Please verify.",
          data: {
            userId: user.id,
            email: user.email,
          },
        });
        return; // ✅ Make sure this function exits
      }

      const isValidOTP = await verifyOTP(user.id, otp);
      if (!isValidOTP) {
        return errorResponse(res, "Invalid OTP", 403);
      }
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

    return successResponse(
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
    console.error("Login Error:", err);
    return errorResponse(res, "Login failed", 500);
  }
};

// TO VERIFY USERS EMAIL:
export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as {
      email: string;
    };

    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user)
      return res.redirect(
        `${process.env.CLIENT_URL}/verify-email?status=not-found`
      );

    if ((user as any).emailVerified)
      return res.redirect(`${process.env.CLIENT_URL}/login?verified=already`);

    await prisma.user.update({
      where: { email: decoded.email },
      data: { emailVerified: true } as any,
    });

    return res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
  } catch (err: any) {
    console.error("Verify Email Error:", err);
    const isExpired = err.name === "TokenExpiredError";

    return res.redirect(
      `${process.env.CLIENT_URL}/verify-email?status=${
        isExpired ? "expired" : "invalid"
      }`
    );
  }
};

// RESENDING VERIFICATION FOR EMAILS:
export const resendVerification = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return errorResponse(res, "User not found", 404);
    if ((user as any).emailVerified)
      return successResponse(res, null, "Email already verified");

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET!, {
      expiresIn: "10m",
    });

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    await sendMail({
      to: email,
      subject: "Verify Your Email",
      text: `Click the link to verify your email: ${verifyUrl}\n\nThis link will expire in 10 minutes. If it does, return to the app and click "Resend Verification".`,
      html: `<p>Click the link to verify your email:</p>
<a href="${verifyUrl}">${verifyUrl}</a>
<p><strong>Note:</strong> This link will expire in <strong>10 minutes</strong>. If it expires, you can request a new one from the app.</p>`,
    });

    return successResponse(res, null, "Verification link resent successfully");
  } catch (err) {
    console.error("Resend Verification Error:", err);
    return errorResponse(res, "Could not resend verification email", 500);
  }
};

// TO VERIFY THE OTP SENT ON LOGIN
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return errorResponse(res, "User ID and OTP are required", 400);
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return errorResponse(res, "User not found", 404);

    const isValid = await verifyOTP(user.id, otp.toString());
    if (!isValid) return errorResponse(res, "Invalid or expired OTP", 403);

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

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return successResponse(
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
      "OTP verified, login successful"
    );
  } catch (err) {
    console.error("OTP Verification Error:", err);
    return errorResponse(res, "Something went wrong", 500);
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
