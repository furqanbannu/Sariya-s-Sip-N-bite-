import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sariya_luxury_dining_mall_road_murree_key_2026';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'owner' | 'admin' | 'manager' | 'staff';
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

/**
 * Sign JWT token for user session
 */
export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Authentication middleware: verifies Bearer token
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({ error: 'Access denied: No authentication token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired session token. Please log in again.' });
    return;
  }
}

/**
 * Authorization middleware: enforces Role-Based Access Control
 */
export function requireRole(allowedRoles: Array<'owner' | 'admin' | 'manager' | 'staff'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Forbidden: Role '${req.user.role}' lacks permission for this section. Required: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
}

/**
 * Helper to record actions in activity_logs audit trail
 */
export function logAudit(
  user: AuthUser | null,
  action: string,
  section: string,
  details: string,
  ip: string = '127.0.0.1'
) {
  try {
    const id = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const email = user ? user.email : 'guest@sariyas.com';
    const userId = user ? user.id : null;

    db.prepare(`
      INSERT INTO activity_logs (id, user_id, user_email, action, section, details, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, email, action, section, details, ip);
  } catch (err) {
    console.error('[Audit Log] Failed to record activity log:', err);
  }
}

/**
 * Helper to create an in-app admin notification
 */
export function createNotification(type: string, title: string, message: string, referenceId?: string) {
  try {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    db.prepare(`
      INSERT INTO notifications (id, type, title, message, reference_id, is_read)
      VALUES (?, ?, ?, ?, ?, 0)
    `).run(id, type, title, message, referenceId || null);
  } catch (err) {
    console.error('[Notification] Failed to create notification:', err);
  }
}
