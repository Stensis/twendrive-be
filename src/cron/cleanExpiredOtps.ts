// src/crons/cleanExpiredOtps.ts

import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cleanExpiredOtps = cron.schedule('0 * * * *', async () => {
  try {
    const result = await prisma.otp.deleteMany({
      where: {
        verified: true,
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    console.log(`🧼 Deleted ${result.count} expired & verified OTP(s) at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('❌ Error cleaning expired OTPs:', error);
  }
});

export default cleanExpiredOtps;
