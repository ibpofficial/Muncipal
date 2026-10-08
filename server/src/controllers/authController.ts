import { Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { generatePublicId } from '../utils/publicIdGenerator';
import { validateEmailAddress } from '../utils/emailValidator';
import { getPermissionsForRole, UserRole } from '../utils/permissions';
import { logAudit } from '../utils/auditLogger';

const AUTHORIZED_AUTHORITY_EMAILS = (process.env.AUTHORIZED_AUTHORITY_EMAILS || 'officer@municipal.gov,admin@municipal.gov').split(',').map((e) => e.trim().toLowerCase());
const AUTHORIZED_AUTHORITY_DOMAIN = process.env.AUTHORIZED_AUTHORITY_DOMAIN || 'municipal.gov';
const VALID_INVITE_CODES = ['MUNI2026', 'ADMIN2026', 'JAIPUR_MUNI_KEY'];

export async function registerUser(req: Request, res: Response) {
  try {
    const {
      firebaseUid,
      email,
      name,
      role = 'USER',
      photoUrl,
      authProvider = 'password',
      // Role extra fields
      phone,
      preferredWard,
      businessName,
      profession,
      serviceArea,
      experience,
      department,
      designation,
      employeeId,
      inviteCode,
      specialization,
      employeeRef,
    } = req.body;

    const emailCheck = await validateEmailAddress(email);
    if (!emailCheck.isValid) {
      return res.status(400).json({ success: false, message: emailCheck.reason });
    }

    const validatedEmail = emailCheck.email;
    const requestedRole = (role || 'USER').toUpperCase() as UserRole;

    const existingUser = await (prisma as any).user.findUnique({
      where: { email: validatedEmail },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This email is already registered. Try signing in instead.',
      });
    }

    // Role assignment rules
    let accountStatus: 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED' = 'ACTIVE';
    let assignedRole: UserRole = requestedRole;

    if (requestedRole === 'AUTHORITY') {
      const isAllowedEmail = AUTHORIZED_AUTHORITY_EMAILS.includes(validatedEmail);
      const isAllowedDomain = validatedEmail.endsWith(`@${AUTHORIZED_AUTHORITY_DOMAIN}`);
      const isValidInvite = inviteCode && VALID_INVITE_CODES.includes(inviteCode.trim());

      if (isAllowedEmail || isAllowedDomain || isValidInvite) {
        accountStatus = 'ACTIVE';
      } else {
        accountStatus = 'PENDING_APPROVAL';
      }
    }

    const uid = firebaseUid || `LOCAL_${validatedEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const publicId = await generatePublicId(assignedRole);

    const newUser = await (prisma as any).user.create({
      data: {
        publicId,
        firebaseUid: uid,
        email: validatedEmail,
        name: name || validatedEmail.split('@')[0],
        role: assignedRole,
        requestedRole: requestedRole !== assignedRole ? requestedRole : null,
        accountStatus,
        emailVerified: authProvider === 'google',
        profileCompleted: true,
        authProvider,
        photoUrl: photoUrl || null,
        lastLoginAt: new Date(),
      },
    });

    // Create role-specific profiles
    if (assignedRole === 'USER') {
      await (prisma as any).userProfile.create({
        data: {
          userId: newUser.id,
          phone: phone || null,
          preferredWard: preferredWard || null,
        },
      });
    } else if (assignedRole === 'PROFESSIONAL') {
      await (prisma as any).professionalProfile.create({
        data: {
          userId: newUser.id,
          businessName: businessName || null,
          profession: profession || null,
          phone: phone || null,
          serviceArea: serviceArea || null,
          experience: experience || null,
          verificationStatus: 'PENDING',
        },
      });
    } else if (assignedRole === 'AUTHORITY') {
      await (prisma as any).authorityProfile.create({
        data: {
          userId: newUser.id,
          department: department || 'Road Operations',
          designation: designation || 'Municipal Authority',
          employeeId: employeeId || null,
          authorizationStatus: accountStatus === 'ACTIVE' ? 'APPROVED' : 'PENDING',
        },
      });
    } else if (assignedRole === 'WORKER') {
      await (prisma as any).workerProfile.create({
        data: {
          userId: newUser.id,
          phone: phone || null,
          specialization: specialization || 'General Maintenance',
          employeeRef: employeeRef || null,
        },
      });
    }

    await logAudit({
      userId: newUser.id,
      publicId: newUser.publicId,
      role: newUser.role,
      action: 'SIGNUP',
      metadata: { requestedRole, accountStatus, authProvider },
    });

    const permissions = getPermissionsForRole(newUser.role);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: newUser.id,
        publicId: newUser.publicId,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        accountStatus: newUser.accountStatus,
        emailVerified: newUser.emailVerified,
        permissions,
      },
    });
  } catch (error: any) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, message: 'Failed to create user account' });
  }
}

export async function syncUser(req: Request, res: Response) {
  try {
    const { firebaseUid, email, name, photoUrl, emailVerified } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const validatedEmail = email.trim().toLowerCase();
    const uid = firebaseUid || `LOCAL_${validatedEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;

    let user = await (prisma as any).user.findFirst({
      where: {
        OR: [{ firebaseUid: uid }, { email: validatedEmail }],
      },
      include: {
        crew: true,
        userProfile: true,
        professionalProfile: true,
        authorityProfile: true,
        workerProfile: true,
      },
    });

    if (!user) {
      // First time Google or auto sync user -> default USER role
      const publicId = await generatePublicId('USER');
      user = await (prisma as any).user.create({
        data: {
          publicId,
          firebaseUid: uid,
          email: validatedEmail,
          name: name || validatedEmail.split('@')[0],
          role: 'USER',
          accountStatus: 'ACTIVE',
          emailVerified: Boolean(emailVerified),
          profileCompleted: true,
          authProvider: 'google',
          photoUrl: photoUrl || null,
          lastLoginAt: new Date(),
        },
        include: { crew: true },
      });

      await (prisma as any).userProfile.create({
        data: { userId: user.id },
      });

      await logAudit({
        userId: user.id,
        publicId: user.publicId,
        role: user.role,
        action: 'SIGNUP',
        metadata: { source: 'google_sync' },
      });
    } else {
      // Update SAFE fields only! Never overwrite role, accountStatus or crewId from body.
      user = await (prisma as any).user.update({
        where: { id: user.id },
        data: {
          firebaseUid: uid,
          name: name || user.name,
          photoUrl: photoUrl || user.photoUrl,
          emailVerified: emailVerified !== undefined ? Boolean(emailVerified) : user.emailVerified,
          lastLoginAt: new Date(),
        },
        include: {
          crew: true,
          userProfile: true,
          professionalProfile: true,
          authorityProfile: true,
          workerProfile: true,
        },
      });

      await logAudit({
        userId: user.id,
        publicId: user.publicId,
        role: user.role,
        action: 'LOGIN',
      });
    }

    const permissions = getPermissionsForRole(user.role);

    res.json({
      success: true,
      message: 'User synchronized successfully',
      user: {
        ...user,
        permissions,
      },
    });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ success: false, message: 'Failed to sync user' });
  }
}

export async function getCurrentUser(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.json({ success: true, user: null });
    }

    const dbUser = await (prisma as any).user.findUnique({
      where: { id: req.user.id },
      include: {
        crew: true,
        userProfile: true,
        professionalProfile: true,
        authorityProfile: true,
        workerProfile: true,
      },
    });

    if (!dbUser) {
      return res.json({ success: true, user: null });
    }

    const permissions = getPermissionsForRole(dbUser.role);

    res.json({
      success: true,
      user: {
        ...dbUser,
        permissions,
      },
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user profile' });
  }
}

export async function getUserPermissions(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthenticated' });
  }
  res.json({
    success: true,
    role: req.user.role,
    permissions: req.user.permissions,
  });
}

export async function logoutUser(req: Request, res: Response) {
  if (req.user) {
    await logAudit({
      userId: req.user.id,
      publicId: req.user.publicId,
      role: req.user.role,
      action: 'LOGOUT',
    });
  }
  res.json({ success: true, message: 'Logged out successfully' });
}

export async function requestRoleUpgrade(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { requestedRole } = req.body;
    if (!['PROFESSIONAL', 'AUTHORITY', 'WORKER'].includes(requestedRole)) {
      return res.status(400).json({ success: false, message: 'Invalid role request' });
    }

    await (prisma as any).user.update({
      where: { id: req.user.id },
      data: { requestedRole },
    });

    await logAudit({
      userId: req.user.id,
      publicId: req.user.publicId,
      role: req.user.role,
      action: 'ROLE_REQUESTED',
      metadata: { requestedRole },
    });

    res.json({ success: true, message: 'Role upgrade request submitted for authority review' });
  } catch (error) {
    console.error('Error requesting role:', error);
    res.status(500).json({ success: false, message: 'Failed to submit role request' });
  }
}

export async function getApprovals(req: Request, res: Response) {
  try {
    const pendingUsers = await (prisma as any).user.findMany({
      where: {
        OR: [
          { accountStatus: 'PENDING_APPROVAL' },
          { requestedRole: { not: null } },
        ],
      },
      include: {
        userProfile: true,
        professionalProfile: true,
        authorityProfile: true,
        workerProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: pendingUsers });
  } catch (error) {
    console.error('Error fetching approvals:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pending approvals' });
  }
}

export async function updateApprovalStatus(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { status, approvedRole } = req.body; // status: APPROVED | REJECTED

    const user = await (prisma as any).user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newRole = approvedRole || user.requestedRole || user.role;
    let newPublicId = user.publicId;

    if (newRole !== user.role) {
      newPublicId = await generatePublicId(newRole);
    }

    const updatedUser = await (prisma as any).user.update({
      where: { id: userId },
      data: {
        accountStatus: status === 'APPROVED' ? 'ACTIVE' : 'SUSPENDED',
        role: status === 'APPROVED' ? newRole : user.role,
        publicId: newPublicId,
        requestedRole: null,
      },
    });

    await logAudit({
      userId: req.user?.id,
      publicId: req.user?.publicId,
      role: req.user?.role,
      action: status === 'APPROVED' ? 'ROLE_APPROVED' : 'ROLE_REJECTED',
      entityType: 'User',
      entityId: user.id,
      metadata: { targetUserEmail: user.email, approvedRole: newRole },
    });

    res.json({ success: true, message: `User ${status.toLowerCase()} successfully`, user: updatedUser });
  } catch (error) {
    console.error('Error updating approval:', error);
    res.status(500).json({ success: false, message: 'Failed to update approval status' });
  }
}

export async function updateUserStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body; // ACTIVE | SUSPENDED | PENDING_APPROVAL

    const user = await (prisma as any).user.update({
      where: { id },
      data: { accountStatus: status },
    });

    await logAudit({
      userId: req.user?.id,
      publicId: req.user?.publicId,
      role: req.user?.role,
      action: 'USER_SUSPENDED',
      entityType: 'User',
      entityId: user.id,
      metadata: { newStatus: status },
    });

    res.json({ success: true, message: `User status set to ${status}`, user });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ success: false, message: 'Failed to update user status' });
  }
}

export async function updateUserCrew(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { crewId } = req.body;

    const user = await (prisma as any).user.update({
      where: { id },
      data: { crewId: crewId || null },
    });

    await logAudit({
      userId: req.user?.id,
      publicId: req.user?.publicId,
      role: req.user?.role,
      action: 'WORKER_CREW_ASSIGNED',
      entityType: 'User',
      entityId: user.id,
      metadata: { crewId },
    });

    res.json({ success: true, message: 'Worker crew assignment updated', user });
  } catch (error) {
    console.error('Error updating user crew:', error);
    res.status(500).json({ success: false, message: 'Failed to update user crew' });
  }
}

export async function getUserActivity(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const activity = await (prisma as any).auditLog.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json({ success: true, data: activity });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activity history' });
  }
}

export async function getFullAuditLog(req: Request, res: Response) {
  try {
    const { userId, role, action, search } = req.query as any;

    const where: any = {};
    if (userId) where.userId = userId;
    if (role) where.role = role;
    if (action) where.action = action;
    if (search) {
      where.OR = [
        { publicId: { contains: search } },
        { action: { contains: search } },
        { entityType: { contains: search } },
      ];
    }

    const logs = await (prisma as any).auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        user: {
          select: { name: true, email: true, publicId: true },
        },
      },
    });

    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
  }
}
