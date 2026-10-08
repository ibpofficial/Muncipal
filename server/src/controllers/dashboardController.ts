import { Request, Response } from 'express';
import { prisma } from '../db/prisma';

export async function getDashboardSummary(req: Request, res: Response) {
  try {
    const totalComplaints = await prisma.complaint.count();
    const critical = await prisma.workOrder.count({ where: { priorityBand: 'CRITICAL' } });
    const high = await prisma.workOrder.count({ where: { priorityBand: 'HIGH' } });
    const medium = await prisma.workOrder.count({ where: { priorityBand: 'MEDIUM' } });
    const low = await prisma.workOrder.count({ where: { priorityBand: 'LOW' } });

    const pending = await prisma.complaint.count({ where: { status: 'PENDING' } });
    const assigned = await prisma.complaint.count({ where: { status: 'ASSIGNED' } });
    const inProgress = await prisma.complaint.count({ where: { status: 'IN_PROGRESS' } });
    const completed = await prisma.complaint.count({ where: { status: 'COMPLETED' } });

    const activeCrews = await prisma.crew.count({ where: { availability: 'AVAILABLE' } });

    const wards = await prisma.ward.findMany({
      include: {
        _count: {
          select: { complaints: true },
        },
      },
    });

    const wardStats = wards.map((w) => ({
      wardId: w.id,
      wardName: w.name.split('-')[0].trim(),
      fullTitle: w.name,
      count: w._count.complaints,
    }));

    const priorityStats = [
      { name: 'Critical', count: critical, color: '#EF4444' },
      { name: 'High', count: high, color: '#F97316' },
      { name: 'Medium', count: medium, color: '#EAB308' },
      { name: 'Low', count: low, color: '#22C55E' },
    ];

    const statusStats = [
      { name: 'Pending', count: pending },
      { name: 'Assigned', count: assigned },
      { name: 'In Progress', count: inProgress },
      { name: 'Completed', count: completed },
    ];

    res.json({
      success: true,
      kpis: {
        totalComplaints,
        critical,
        high,
        medium,
        low,
        pending,
        activeCrews,
      },
      charts: {
        byPriority: priorityStats,
        byWard: wardStats,
        byStatus: statusStats,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve dashboard summary' });
  }
}
