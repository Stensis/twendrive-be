import { sendMail } from "./mailer";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Generate 6-digit OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const sendEmailOTP = async (userId: number, email: string) => {
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

  // ✅ Clear any old OTPs
  await prisma.otp.deleteMany({
    where: { userId },
  });

  // ✅ Create new OTP
  await prisma.otp.create({
    data: {
      userId,
      code,
      expiresAt,
      verified: false, // ← make sure it's false!
    },
  });

  await sendMail({
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${code}. It expires in 5 minutes.`,
  });
};

/**
 * Verifies the OTP code
 */
export const verifyOTP = async (userId: number, code: string): Promise<boolean> => {
  console.log('Verifying OTP for user:', userId, 'code:', code);

  const otp = await prisma.otp.findFirst({
    where: {
      userId,
      code: code.toString(),
      expiresAt: { gt: new Date() },
      verified: false,
    },
  });

  if (!otp) {
    console.warn('OTP not found or already verified or expired');
    return false;
  }

  await prisma.otp.update({
    where: { id: otp.id },
    data: { verified: true },
  });

  return true;
};
