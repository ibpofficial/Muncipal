import { Request, Response } from 'express';
import { prisma } from '../db/prisma';

export async function syncUser(req: Request, res: Response) {
  try {
    const { firebaseUid, email, name, role = 'OFFICER', crewId } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const uid = firebaseUid || `LOCAL_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;

    let user = await (prisma as any).user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await (prisma as any).user.create({
        data: {
          firebaseUid: uid,
          email,
          name: name || email.split('@')[0],
          role: role.toUpperCase(),
          crewId: crewId || null,
        },
      });
    } else {
      user = await (prisma as any).user.update({
        where: { id: user.id },
        data: {
          name: name || user.name,
          role: role ? role.toUpperCase() : user.role,
          crewId: crewId !== undefined ? crewId : user.crewId,
        },
      });
    }

    res.json({
      success: true,
      message: 'User synchronized successfully',
      user,
    });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ success: false, message: 'Failed to sync user' });
  }
}

export async function getCurrentUser(req: Request, res: Response) {
  try {
    const roleHeader = req.headers['x-user-role'] as string;
    const crewIdHeader = req.headers['x-crew-id'] as string;
    const emailHeader = req.headers['x-user-email'] as string;

    const email = emailHeader || 'officer@municipal.gov';

    let user = await (prisma as any).user.findUnique({
      where: { email },
      include: { crew: true },
    });

    if (!user) {
      user = {
        id: 'user-default-1',
        firebaseUid: 'local-admin-uid',
        email: 'officer@municipal.gov',
        name: 'Chief Municipal Officer',
        role: roleHeader || 'OFFICER',
        crewId: crewIdHeader || null,
      };
    } else if (roleHeader) {
      user = { ...user, role: roleHeader };
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
}
