import { Request, Response } from 'express';
import { prisma } from '../db/prisma';

export async function getMapWorkOrders(req: Request, res: Response) {
  try {
    const workOrders = await prisma.workOrder.findMany({
      include: {
        complaint: {
          include: { ward: true },
        },
        assignedCrew: true,
      },
      orderBy: {
        priorityScore: 'desc',
      },
    });

    const assets = await prisma.roadAsset.findMany({
      include: { ward: true },
    });

    const crews = await prisma.crew.findMany();

    const mapPoints = workOrders.map((wo) => ({
      workOrderId: wo.workOrderNumber,
      dbId: wo.id,
      ticketNumber: wo.complaint.ticketNumber,
      latitude: wo.complaint.latitude,
      longitude: wo.complaint.longitude,
      priorityScore: wo.priorityScore,
      priorityBand: wo.priorityBand,
      severity: wo.severity,
      roadType: wo.complaint.roadType,
      description: wo.complaint.description,
      wardName: wo.complaint.ward.name.split('-')[0].trim(),
      fullWardName: wo.complaint.ward.name,
      status: wo.status,
      reportedAt: wo.complaint.reportedAt,
    }));

    res.json({
      success: true,
      count: mapPoints.length,
      workOrders: mapPoints,
      assets,
      crews,
    });
  } catch (error) {
    console.error('Error fetching map data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch map data' });
  }
}
