import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { verifyToken } from '../utils/jwt.js';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        role: 'ADMIN' | 'EMPLOYEE';
      };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication required.' });
  }

  try {
    const token = authorization.replace('Bearer ', '');
    req.auth = verifyToken(token);
    return next();
  } catch {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid or expired token.' });
  }
}

export function requireRole(role: 'ADMIN' | 'EMPLOYEE') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.auth?.role !== role) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'You do not have permission for this action.' });
    }
    return next();
  };
}