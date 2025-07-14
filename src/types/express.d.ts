import { Request } from 'express';

export interface JwtPayload {
  id: number;         
  email: string;
  role: string;
  [key: string]: any;  
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
  cookies: {
    refreshToken?: string;
    [key: string]: any;
  };
}

export type SelectedUser = Prisma.UserGetPayload<{
  select: typeof userSelectFields;
}>;