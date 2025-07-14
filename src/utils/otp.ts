import { sendMail } from './mailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const sendEmailOTP = async (userId: number, email: string) => {
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

  // Save OTP
  await prisma.otp.create({
    data: {
      userId,
      code,
      expiresAt,
    },
  });

  // Send email
  await sendMail({
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${code}. It expires in 5 minutes.`,
  });
  console.log(`✅ OTP sent to: ${email}`);
};

/**
 * Verifies the OTP code
 */
export const verifyOTP = async (userId: number, code: string): Promise<boolean> => {
  const otp = await prisma.otp.findFirst({
    where: {
      userId,
      code,
      expiresAt: {
        gt: new Date(),
      },
      verified: false,
    },
  });

  if (!otp) return false;

  // Mark as verified
  await prisma.otp.update({
    where: { id: otp.id },
    data: { verified: true },
  });

  return true;
};
