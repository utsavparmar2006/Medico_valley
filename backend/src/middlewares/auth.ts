import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/auth';

export interface AuthenticatedRequest extends Request {
  adminId?: string;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    // We return tokenExpired: true so the client interceptor knows to call the refresh endpoint
    return res.status(401).json({ message: 'Invalid or expired access token.', tokenExpired: true });
  }

  req.adminId = decoded.adminId;
  next();
}
