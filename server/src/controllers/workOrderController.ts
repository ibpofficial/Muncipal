import { Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { calculatePriorityDecision } from '../algorithms/priorityEngine';

export async function getWorkOrders(req: Request, res: Response) {
  try {
    const { priorityBand, status, wardId, search } = req.query;

    const whereClause: any = {};

    if (priorityBand && typeof priorityBand === 'string' && priorityBand !== 'ALL') {
      whereClause.priorityBand = priorityBand;
    }
    if (status && typeof status === 'string' && status !== 'ALL') {
      whereClause.status = status;
    }
    if (wardId && typeof wardId === 'string' && wardId !== 'ALL') {
      whereClause.complaint = { wardId };
    }
    if (search && typeof search === 'string' && search.trim()) {
      whereClause.OR = [
        { workOrderNumber: { contains: search } },
        { complaint: { ticketNumber: { contains: search } } },
        { complaint: { description: { contains: search } } },
      ];
    }

    const workOrders = await prisma.workOrder.findMany({
      where: whereClause,
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

    const formatted = workOrders.map((wo) => ({
      ...wo,
      reasons: JSON.parse(wo.reasons || '[]'),
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    console.error('Error fetching work orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch work orders' });
  }
}

export async function getWorkOrderById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const workOrder = await prisma.workOrder.findFirst({
      where: {
        OR: [{ id }, { workOrderNumber: id }],
      },
      include: {
        complaint: {
          include: { ward: true },
        },
        assignedCrew: true,
      },
    });

    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    const assets = await prisma.roadAsset.findMany({
      where: { wardId: workOrder.complaint.wardId },
    });

    const crews = await prisma.crew.findMany();

    const decision = calculatePriorityDecision(
      {
        id: workOrder.complaint.id,
        description: workOrder.complaint.description,
        latitude: workOrder.complaint.latitude,
        longitude: workOrder.complaint.longitude,
        roadType: workOrder.complaint.roadType,
        reportedAt: workOrder.complaint.reportedAt,
      },
      assets,
      crews
    );

    const responsePayload = {
      id: workOrder.workOrderNumber,
      dbId: workOrder.id,
      priorityScore: workOrder.priorityScore,
      priorityBand: workOrder.priorityBand,
      severity: workOrder.severity,
      status: workOrder.status,
      scheduledDate: workOrder.scheduledDate,
      assignedCrew: workOrder.assignedCrew,
      complaint: workOrder.complaint,

      factors: {
        severity: workOrder.severityScore,
        exposure: workOrder.exposureScore,
        traffic: workOrder.trafficScore,
        age: workOrder.ageScore,
        crewProximity: workOrder.crewProximityScore,
      },

      reasons: JSON.parse(workOrder.reasons || '[]'),
      recommendation: workOrder.recommendation,
      nearbyAssets: decision.nearbyAssets,
    };

    res.json({ success: true, data: responsePayload });
  } catch (error) {
    console.error('Error fetching work order by ID:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch work order details' });
  }
}

export async function recalculatePriority(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const workOrder = await prisma.workOrder.findFirst({
      where: {
        OR: [{ id }, { workOrderNumber: id }],
      },
      include: { complaint: true },
    });

    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    const assets = await prisma.roadAsset.findMany();
    const crews = await prisma.crew.findMany();

    const decision = calculatePriorityDecision(
      {
        id: workOrder.complaint.id,
        description: workOrder.complaint.description,
        latitude: workOrder.complaint.latitude,
        longitude: workOrder.complaint.longitude,
        roadType: workOrder.complaint.roadType,
        reportedAt: workOrder.complaint.reportedAt,
      },
      assets,
      crews
    );

    const updatedWO = await prisma.workOrder.update({
      where: { id: workOrder.id },
      data: {
        severity: decision.severity,
        severityScore: decision.factors.severity,
        exposureScore: decision.factors.exposure,
        trafficScore: decision.factors.traffic,
        ageScore: decision.factors.age,
        crewProximityScore: decision.factors.crewProximity,
        priorityScore: decision.priorityScore,
        priorityBand: decision.priorityBand,
        reasons: JSON.stringify(decision.reasons),
        recommendation: decision.recommendation,
      },
    });

    res.json({
      success: true,
      message: 'Priority score recalculated successfully',
      workOrder: updatedWO,
      decision,
    });
  } catch (error) {
    console.error('Error recalculating priority:', error);
    res.status(500).json({ success: false, message: 'Failed to recalculate priority' });
  }
}
