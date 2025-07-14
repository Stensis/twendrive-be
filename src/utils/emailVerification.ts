// src/utils/emailVerification.ts
import jwt from 'jsonwebtoken';

export const generateVerificationToken = (email: string) => {
  return jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '10m' });
};

