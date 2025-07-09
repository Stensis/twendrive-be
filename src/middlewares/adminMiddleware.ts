import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from 'src/types/express';

const adminMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
     res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};

export default adminMiddleware;
