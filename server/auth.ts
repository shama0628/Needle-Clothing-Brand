import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { query, hashPassword } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'needle_secret_signature_key_2026_atelier';

export interface AuthUser {
  id: string;
  customerNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function createToken(user: AuthUser, expiresInSeconds = 86400 * 7): string {
  const payload = {
    sub: user.id,
    customerNumber: user.customerNumber,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(encodedPayload).digest('base64url');
  return `${encodedPayload}.${signature}`;
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encodedPayload, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(encodedPayload).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return {
      id: payload.sub,
      customerNumber: payload.customerNumber,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: payload.role
    };
  } catch {
    return null;
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (req.headers['x-auth-token'] as string);
  if (token) {
    const user = verifyToken(token);
    if (user) {
      req.user = user;
    }
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required. Please log in to continue.' });
    return;
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Administrator access required.' });
    return;
  }
  next();
}
