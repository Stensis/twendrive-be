import bcrypt from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> =>
  await bcrypt.hash(password, 10);

export const comparePassword = async (password: string, hashed: string): Promise<boolean> =>
  await bcrypt.compare(password, hashed);
