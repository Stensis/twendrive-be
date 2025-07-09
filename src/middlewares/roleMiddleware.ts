import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from 'src/types/express';

const roleMiddleware = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
       res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }

    next();
  };
};

export default roleMiddleware;
