import { Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { calculatePriorityDecision } from '../algorithms/priorityEngine';

export async function getComplaints(req: Request, res: Response) {
  try {
    const { wardId, priorityBand, status, search } = req.query;

    const whereClause: any = {};

    if (wardId && typeof wardId === 'string' && wardId !== 'ALL') {
      whereClause.wardId = wardId;
    }
    if (status && typeof status === 'string' && status !== 'ALL') {
      whereClause.status = status;
    }
    if (search && typeof search === 'string' && search.trim()) {
      whereClause.OR = [
        { ticketNumber: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (priorityBand && typeof priorityBand === 'string' && priorityBand !== 'ALL') {
      whereClause.workOrder = { priorityBand: priorityBand };
    }

    const complaints = await prisma.complaint.findMany({
      where: whereClause,
      include: {
        ward: true,
        workOrder: {
          include: {
            assignedCrew: true,
          },
        },
      },
      orderBy: {
        reportedAt: 'desc',
      },
    });

    res.json({ success: true, count: complaints.length, data: complaints });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch complaints' });
  }
}

export async function getComplaintById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        ward: true,
        workOrder: {
          include: {
            assignedCrew: true,
          },
        },
      },
    });

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.json({ success: true, data: complaint });
  } catch (error) {
    console.error('Error fetching complaint by ID:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch complaint details' });
  }
}

export async function createComplaint(req: Request, res: Response) {
  try {
    const { description, latitude, longitude, roadType, wardId, photoUrl } = req.body;

    if (!description || !latitude || !longitude || !roadType || !wardId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: description, latitude, longitude, roadType, wardId',
      });
    }

    const parsedLat = parseFloat(latitude);
    const parsedLng = parseFloat(longitude);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude must be valid numbers' });
    }

    const ward = await prisma.ward.findUnique({ where: { id: wardId } });
    if (!ward) {
      return res.status(404).json({ success: false, message: `Ward with ID ${wardId} not found` });
    }

    const count = await prisma.complaint.count();
    const nextNum = String(count + 1).padStart(3, '0');
    const complaintId = `CMP-${nextNum}`;
    const ticketNumber = `TKT-${wardId.split('-')[1] || '00'}-${nextNum}`;

    const complaint = await prisma.complaint.create({
      data: {
        id: complaintId,
        ticketNumber,
        description,
        photoUrl: photoUrl || null,
        latitude: parsedLat,
        longitude: parsedLng,
        wardId,
        roadType,
        status: 'PENDING',
      },
      include: { ward: true },
    });

    const assets = await prisma.roadAsset.findMany();
    const crews = await prisma.crew.findMany();

    const decision = calculatePriorityDecision(
      {
        id: complaint.id,
        description: complaint.description,
        latitude: complaint.latitude,
        longitude: complaint.longitude,
        roadType: complaint.roadType,
        reportedAt: complaint.reportedAt,
      },
      assets,
      crews
    );

    const workOrderNumber = `WO-${nextNum}`;

    const workOrder = await prisma.workOrder.create({
      data: {
        id: `WO-ID-${nextNum}`,
        workOrderNumber,
        complaintId: complaint.id,
        severity: decision.severity,
        severityScore: decision.factors.severity,
        exposureScore: decision.factors.exposure,
        trafficScore: decision.factors.traffic,
        ageScore: decision.factors.age,
        crewProximityScore: decision.factors.crewProximity,
        priorityScore: decision.priorityScore,
        priorityBand: decision.priorityBand,
        assignedCrewId: null,
        status: 'PENDING',
        reasons: JSON.stringify(decision.reasons),
        recommendation: decision.recommendation,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully and priority score calculated',
      complaint,
      workOrder,
      decision: {
        id: workOrder.workOrderNumber,
        priorityScore: decision.priorityScore,
        priorityBand: decision.priorityBand,
        severity: decision.severity,
        factors: decision.factors,
        reasons: decision.reasons,
        recommendation: decision.recommendation,
        nearbyAssets: decision.nearbyAssets,
      },
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ success: false, message: 'Failed to create complaint' });
  }
}
