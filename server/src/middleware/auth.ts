import { Request, Response, NextFunction } from 'express';
import { getFirebaseAdmin } from '../utils/firebaseAdmin';
import { prisma } from '../db/prisma';
import { getPermissionsForRole, UserRole } from '../utils/permissions';
import { AuthenticatedUser } from '../types/express';

export async function firebaseAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = undefined;
      return next();
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      req.user = undefined;
      return next();
    }

    const admin = getFirebaseAdmin();
    let decodedToken: any;

    try {
      decodedToken = await admin.auth().verifyIdToken(token, true); // checkRevoked = true
    } catch (verifyError: any) {
      console.warn('[Auth Middleware Warning] Token verification failed:', verifyError.message);
      req.user = undefined;
      return next();
    }

    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email;

    let dbUser = await (prisma as any).user.findUnique({
      where: { firebaseUid },
      include: { crew: true },
    });

    // Fallback: if missing by firebaseUid, look up by email
    if (!dbUser && email) {
      dbUser = await (prisma as any).user.findUnique({
        where: { email },
        include: { crew: true },
      });
      if (dbUser) {
        // Link firebaseUid
        dbUser = await (prisma as any).user.update({
          where: { id: dbUser.id },
          data: { firebaseUid },
          include: { crew: true },
        });
      }
    }

    if (!dbUser) {
      req.user = undefined;
      return next();
    }

    const role = (dbUser.role || 'USER').toUpperCase() as UserRole;
    const permissions = getPermissionsForRole(role);

    const userObj: AuthenticatedUser = {
      id: dbUser.id,
      publicId: dbUser.publicId,
      firebaseUid: dbUser.firebaseUid,
      email: dbUser.email,
      name: dbUser.name,
      role,
      crewId: dbUser.crewId,
      accountStatus: dbUser.accountStatus as any,
      emailVerified: Boolean(decodedToken.email_verified || dbUser.emailVerified),
      profileCompleted: Boolean(dbUser.profileCompleted),
      permissions,
    };

    req.user = userObj;
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    req.user = undefined;
    next();
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in to continue.',
    });
  }
  next();
}

export function requireVerifiedEmail(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required. Please verify your email to access this resource.',
    });
  }
  next();
}

export function requireActiveAccount(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  if (req.user.accountStatus === 'PENDING_APPROVAL') {
    return res.status(403).json({
      success: false,
      message: 'Your account is awaiting municipal authority approval.',
    });
  }

  if (req.user.accountStatus === 'SUSPENDED') {
    return res.status(403).json({
      success: false,
      message: 'Your account has been suspended. Please contact municipal support.',
    });
  }

  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const userRole = req.user.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of the following roles: ${roles.join(', ')}`,
      });
    }

    next();
  };
}

export function requirePermission(...perms: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const userPermissions = req.user.permissions || [];
    const hasPermission = perms.every((p) => userPermissions.includes(p));

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission for this operation.',
      });
    }

    next();
  };
}
