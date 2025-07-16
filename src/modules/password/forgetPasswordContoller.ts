import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { errorResponse, successResponse } from "src/utils/response";
import { sendMail } from "@utils/mailer";
import { getResetPasswordTemplate } from "@utils/templates/verifyEmailTemplate";

const prisma = new PrismaClient();

// Generate token for reset (JWT or random string)
const generateResetToken = (userId: number) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "15m" });
};

const verifyResetToken = (token: string): { userId: number } | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
  } catch {
    return null;
  }
};

// 1️⃣ Request Password Reset
export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return errorResponse(res, "No account found with this email", 404);
    }

    const resetToken = generateResetToken(user.id);
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    const { text, html } = getResetPasswordTemplate(
      user.firstName ?? user.userName ?? "User",
      resetToken
    );

    await sendMail({
      to: user.email,
      subject: "Reset Your Password",
      text,
      html,
    });
    return successResponse(res, null, "Password reset email sent.");
  } catch (err: any) {
    console.error("Request Reset Error:", err);
    return errorResponse(res, "Something went wrong", 500);
  }
};

// 2️⃣ Perform Password Reset
export const resetPassword = async (req: Request, res: Response) => {
  const { token, password, confirmPassword } = req.body;

  if (!token) return errorResponse(res, "Token missing", 400);
  if (password !== confirmPassword)
    return errorResponse(res, "Password mismatch", 400);

  try {
    const payload = verifyResetToken(token);
    if (!payload) return errorResponse(res, "Invalid or expired token", 400);

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: payload.userId },
      data: { password: hashedPassword },
    });

    return successResponse(res, null, "Password reset successful.");
  } catch (err: any) {
    console.error("Reset Password Error:", err);
    return errorResponse(res, "Password reset failed", 500);
  }
};
