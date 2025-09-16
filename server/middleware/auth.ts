import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// JWT_SECRET MUST be set as an environment variable for security
// Only allow fallback in development with explicit warnings
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️  WARNING: JWT_SECRET not set. Using default for development only. Set JWT_SECRET for production!');
  } else {
    throw new Error('JWT_SECRET environment variable is required in non-development environments.');
  }
}

const jwtSecret: string = JWT_SECRET || 'dev-jwt-secret-key-CHANGE-IN-PRODUCTION-fixed-for-stability';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    role: string;
  };
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
  }

  jwt.verify(token, jwtSecret, async (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        error: 'Invalid or expired token' 
      });
    }

    try {
      const user = await storage.getUser(decoded.userId);
      if (!user) {
        return res.status(403).json({ 
          success: false, 
          error: 'User not found' 
        });
      }

      req.user = {
        id: user.id,
        name: user.name,
        role: user.role
      };
      next();
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        error: 'Authentication error' 
      });
    }
  });
}

export function requireRole(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions' 
      });
    }

    next();
  };
}