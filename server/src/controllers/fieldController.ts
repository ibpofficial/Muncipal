import { Request, Response } from 'express';
import { prisma } from '../db/prisma';

export async function getFieldTodayJobs(req: Request, res: Response) {
  try {
    const crewIdParam = req.query.crewId as string;
    const crewIdHeader = req.headers['x-crew-id'] as string;
    
    // Default to CREW-01 if unspecified
    const crewId = crewIdParam || crewIdHeader || 'CREW-01';

    const crew = await prisma.crew.findUnique({
      where: { id: crewId },
    });

    if (!crew) {
      return res.status(404).json({ success: false, message: 'Crew not found' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const planItems = await (prisma as any).planItem.findMany({
      where: {
        crewId,
      },
      include: {
        workOrder: {
          include: {
            complaint: { include: { ward: true } },
            evidencePhotos: true,
          },
        },
      },
      orderBy: { sequence: 'asc' },
    });

    // Also fetch work orders directly assigned to crew even if not in today's daily plan item
    const assignedWorkOrders = await (prisma as any).workOrder.findMany({
      where: {
        assignedCrewId: crewId,
      },
      include: {
        complaint: { include: { ward: true } },
        evidencePhotos: true,
      },
      orderBy: [{ priorityScore: 'desc' }],
    });

    const jobsMap = new Map();

    planItems.forEach((item: any) => {
      jobsMap.set(item.workOrderId, {
        planItemId: item.id,
        sequence: item.sequence,
        scheduledStart: item.scheduledStart,
        estimatedDuration: item.estimatedDuration,
        travelDistanceKm: item.travelDistanceKm,
        travelTimeMin: item.travelTimeMin,
        workOrder: item.workOrder,
      });
    });

    let seqCounter = planItems.length + 1;
    assignedWorkOrders.forEach((wo: any) => {
      if (!jobsMap.has(wo.id)) {
        jobsMap.set(wo.id, {
          planItemId: `TEMP-${wo.id}`,
          sequence: seqCounter++,
          scheduledStart: '10:00',
          estimatedDuration: wo.estimatedDuration || 90,
          travelDistanceKm: 1.5,
          travelTimeMin: 10,
          workOrder: wo,
        });
      }
    });

    const jobs = Array.from(jobsMap.values()).sort((a, b) => a.sequence - b.sequence);

    const completedCount = jobs.filter((j) => j.workOrder.status === 'COMPLETED').length;
    const nextJob = jobs.find((j) => j.workOrder.status !== 'COMPLETED');

    res.json({
      success: true,
      data: {
        crew,
        date: todayStr,
        totalJobs: jobs.length,
        completedJobs: completedCount,
        remainingJobs: jobs.length - completedCount,
        nextJob: nextJob || null,
        jobs,
      },
    });
  } catch (error) {
    console.error('Error in getFieldTodayJobs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch field crew jobs' });
  }
}

export async function startWorkOrder(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const workOrder: any = await (prisma as any).workOrder.findFirst({
      where: { OR: [{ id }, { workOrderNumber: id }] },
    });

    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    if (workOrder.status === 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Work order is already completed' });
    }

    const now = new Date();

    const updatedWO = await (prisma as any).workOrder.update({
      where: { id: workOrder.id },
      data: {
        status: 'IN_PROGRESS',
        actualStartTime: workOrder.actualStartTime || now,
      },
      include: {
        complaint: { include: { ward: true } },
        assignedCrew: true,
        evidencePhotos: true,
      },
    });

    await prisma.complaint.update({
      where: { id: workOrder.complaintId },
      data: { status: 'IN_PROGRESS' },
    });

    res.json({
      success: true,
      message: `Work order ${updatedWO.workOrderNumber} started`,
      workOrder: updatedWO,
    });
  } catch (error) {
    console.error('Error starting work order:', error);
    res.status(500).json({ success: false, message: 'Failed to start work order' });
  }
}

export async function completeWorkOrder(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { completionNotes, afterPhotoUrl } = req.body;

    const workOrder: any = await (prisma as any).workOrder.findFirst({
      where: { OR: [{ id }, { workOrderNumber: id }] },
      include: { evidencePhotos: true },
    });

    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    const now = new Date();
    const startTime = workOrder.actualStartTime ? new Date(workOrder.actualStartTime) : new Date(now.getTime() - (workOrder.estimatedDuration || 90) * 60000);
    const durationMinutes = Math.max(15, Math.round((now.getTime() - startTime.getTime()) / 60000));

    const updatedWO = await (prisma as any).workOrder.update({
      where: { id: workOrder.id },
      data: {
        status: 'COMPLETED',
        actualCompletedTime: now,
        actualStartTime: startTime,
        actualDuration: durationMinutes,
        completionNotes: completionNotes || 'Asphalt repaired, surface leveled and sealed.',
      },
      include: {
        complaint: { include: { ward: true } },
        assignedCrew: true,
        evidencePhotos: true,
      },
    });

    await prisma.complaint.update({
      where: { id: workOrder.complaintId },
      data: { status: 'COMPLETED' },
    });

    if (afterPhotoUrl) {
      await (prisma as any).photoEvidence.create({
        data: {
          workOrderId: workOrder.id,
          type: 'AFTER',
          url: afterPhotoUrl,
          uploadedBy: req.headers['x-user-id'] as string || 'FIELD_CREW',
        },
      });
    }

    res.json({
      success: true,
      message: `Work order ${updatedWO.workOrderNumber} completed successfully`,
      workOrder: updatedWO,
    });
  } catch (error) {
    console.error('Error completing work order:', error);
    res.status(500).json({ success: false, message: 'Failed to complete work order' });
  }
}

export async function uploadEvidence(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { type, url, storagePath } = req.body;

    if (!type || !url) {
      return res.status(400).json({ success: false, message: 'Type and URL are required' });
    }

    const workOrder = await prisma.workOrder.findFirst({
      where: { OR: [{ id }, { workOrderNumber: id }] },
    });

    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    const evidence = await (prisma as any).photoEvidence.create({
      data: {
        workOrderId: workOrder.id,
        type: type.toUpperCase(), // BEFORE or AFTER or COMPLAINT
        url,
        storagePath: storagePath || null,
        uploadedBy: (req.headers['x-user-id'] as string) || 'FIELD_CREW',
      },
    });

    res.json({
      success: true,
      message: 'Evidence photo saved successfully',
      evidence,
    });
  } catch (error) {
    console.error('Error saving evidence photo:', error);
    res.status(500).json({ success: false, message: 'Failed to save evidence photo' });
  }
}
