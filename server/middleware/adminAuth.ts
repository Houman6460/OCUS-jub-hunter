import { Request, Response, NextFunction } from 'express';
import session from 'express-session';

declare module 'express-session' {
  interface SessionData {
    adminUser?: {
      id?: string;
      email: string;
      isAdmin: boolean;
      loginTime: number;
      lastActivity: number;
    };
  }
}

// Enhanced middleware to check admin authentication with session timeout
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.adminUser) {
    return res.status(401).json({ message: "Admin authentication required" });
  }

  // Check session timeout (30 minutes = 1800000 ms)
  const sessionTimeout = 30 * 60 * 1000;
  const now = Date.now();
  const lastActivity = req.session.adminUser.lastActivity || req.session.adminUser.loginTime;
  
  if (now - lastActivity > sessionTimeout) {
    console.warn(`Admin session expired for: ${req.session.adminUser.email} - last activity: ${new Date(lastActivity).toISOString()}`);
    req.session.destroy((err) => {
      if (err) console.error('Session destroy error:', err);
    });
    return res.status(401).json({ message: "Session expired. Please login again." });
  }

  // Update last activity
  req.session.adminUser.lastActivity = now;
  next();
}

// Audit logging middleware for admin actions
export function auditLog(action: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const adminUser = req.session?.adminUser;
    if (adminUser) {
      console.info(`AUDIT: Admin ${adminUser.email} performed action: ${action} from IP: ${req.ip} at ${new Date().toISOString()}`);
    }
    next();
  };
}