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

    const complaints = await (prisma as any).complaint.findMany({
      where: whereClause,
      include: {
        ward: true,
        comments: { orderBy: { createdAt: 'asc' } },
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
    const complaint = await (prisma as any).complaint.findUnique({
      where: { id },
      include: {
        ward: true,
        comments: { orderBy: { createdAt: 'asc' } },
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

export async function upvoteComplaint(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const complaint: any = await (prisma as any).complaint.findFirst({
      where: { OR: [{ id }, { ticketNumber: id }] },
      include: { workOrder: true, ward: true },
    });

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const updatedComplaint = await (prisma as any).complaint.update({
      where: { id: complaint.id },
      data: {
        upvoteCount: (complaint.upvoteCount || 0) + 1,
      },
      include: { ward: true, workOrder: true },
    });

    let updatedWorkOrder = complaint.workOrder;

    if (complaint.workOrder) {
      // Calculate upvote priority boost: +2 points per upvote, capped at +20
      const currentCount = updatedComplaint.upvoteCount;
      const boost = Math.min(20, currentCount * 2);
      
      const newScore = Math.min(100, Math.round(complaint.workOrder.priorityScore + boost));
      let newBand = 'LOW';
      if (newScore >= 80) newBand = 'CRITICAL';
      else if (newScore >= 60) newBand = 'HIGH';
      else if (newScore >= 40) newBand = 'MEDIUM';

      updatedWorkOrder = await (prisma as any).workOrder.update({
        where: { id: complaint.workOrder.id },
        data: {
          priorityScore: newScore,
          priorityBand: newBand,
        },
      });
    }

    res.json({
      success: true,
      message: `Upvoted complaint ${complaint.ticketNumber}! Priority boosted.`,
      complaint: updatedComplaint,
      workOrder: updatedWorkOrder,
    });
  } catch (error) {
    console.error('Error upvoting complaint:', error);
    res.status(500).json({ success: false, message: 'Failed to upvote complaint' });
  }
}

export async function addComment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { authorName, text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const complaint = await (prisma as any).complaint.findFirst({
      where: { OR: [{ id }, { ticketNumber: id }] },
    });

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const comment = await (prisma as any).comment.create({
      data: {
        complaintId: complaint.id,
        authorName: authorName || 'Citizen',
        text: text.trim(),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment,
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, message: 'Failed to add comment' });
  }
}


