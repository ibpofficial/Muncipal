import { Request, Response } from 'express';
import { prisma } from '../db/prisma';

export async function getCrews(req: Request, res: Response) {
  try {
    const crews = await prisma.crew.findMany({
      include: {
        workOrders: {
          where: {
            status: { in: ['ASSIGNED', 'IN_PROGRESS'] },
          },
          include: {
            complaint: {
              include: { ward: true },
            },
          },
        },
      },
    });

    const formattedCrews = crews.map((c) => ({
      id: c.id,
      name: c.name,
      members: c.members,
      specialization: c.specialization,
      currentLatitude: c.currentLatitude,
      currentLongitude: c.currentLongitude,
      availability: c.availability,
      dailyCapacity: c.dailyCapacity,
      todayAssignedJobs: c.workOrders.length,
      activeJobs: c.workOrders,
    }));

    res.json({ success: true, count: formattedCrews.length, data: formattedCrews });
  } catch (error) {
    console.error('Error fetching crews:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch crews' });
  }
}
