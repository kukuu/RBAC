//Auth Middleware
//..........
// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
      const decoded: any = verifyToken(token.split(' ')[1]);
      req.user = decoded;
      
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  };
};