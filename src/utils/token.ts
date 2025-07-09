import jwt from "jsonwebtoken";
import { JwtPayload } from "src/types/express";

export const generateToken = (
  payload: string | object | Buffer,
  secret: jwt.Secret,
  expiresIn: string
): string => {
  return jwt.sign(payload, secret, {
    expiresIn: expiresIn as any, 
  });
};
