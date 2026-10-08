import { Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { generateDailyPlan } from '../algorithms/dailyPlanEngine';

export async function getDailyPlan(req: Request, res: Response) {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // Check if plan exists for today
    let dailyPlan = await prisma.dailyPlan.findFirst({
      where: { date: todayStr },
      include: {
        items: {
          include: {
            workOrder: {
              include: { complaint: { include: { ward: true } } },
            },
            crew: true,
          },
          orderBy: [{ crewId: 'asc' }, { sequence: 'asc' }],
        },
      },
    });

    // If no plan exists, generate one automatically
    if (!dailyPlan || dailyPlan.items.length === 0) {
      return await generateAndSaveDailyPlan(req, res);
    }

    // Format response
    const workOrders = await prisma.workOrder.findMany({
      include: { complaint: { include: { ward: true } } },
    });
    const crews = await prisma.crew.findMany();

    const planResult = generateDailyPlan(
      workOrders.map((w) => ({
        id: w.id,
        workOrderNumber: w.workOrderNumber,
        priorityScore: w.priorityScore,
        severity: w.severity,
        roadType: w.complaint.roadType,
        latitude: w.complaint.latitude,
        longitude: w.complaint.longitude,
        estimatedDuration: w.estimatedDuration,
        description: w.complaint.description,
        priorityBand: w.priorityBand,
        wardName: w.complaint.ward.name.split('-')[0].trim(),
      })),
      crews.map((c) => ({
        id: c.id,
        name: c.name,
        specialization: c.specialization,
        currentLatitude: c.currentLatitude,
        currentLongitude: c.currentLongitude,
        availabilityStatus: c.availabilityStatus,
        workingStart: c.workingStart,
        workingEnd: c.workingEnd,
        dailyCapacity: c.dailyCapacity,
        assignedCount: 0,
      })),
      todayStr
    );

    res.json({
      success: true,
      data: planResult,
    });
  } catch (error) {
    console.error('Error in getDailyPlan:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve daily plan' });
  }
}

export async function generateAndSaveDailyPlan(req: Request, res: Response) {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // Fetch pending and assigned work orders
    const workOrders = await prisma.workOrder.findMany({
      where: {
        status: { in: ['PENDING', 'ASSIGNED', 'SCHEDULED'] },
      },
      include: { complaint: { include: { ward: true } } },
    });

    const crews = await prisma.crew.findMany();

    const planResult = generateDailyPlan(
      workOrders.map((w) => ({
        id: w.id,
        workOrderNumber: w.workOrderNumber,
        priorityScore: w.priorityScore,
        severity: w.severity,
        roadType: w.complaint.roadType,
        latitude: w.complaint.latitude,
        longitude: w.complaint.longitude,
        estimatedDuration: w.estimatedDuration,
        description: w.complaint.description,
        priorityBand: w.priorityBand,
        wardName: w.complaint.ward.name.split('-')[0].trim(),
      })),
      crews.map((c) => ({
        id: c.id,
        name: c.name,
        specialization: c.specialization,
        currentLatitude: c.currentLatitude,
        currentLongitude: c.currentLongitude,
        availabilityStatus: c.availabilityStatus,
        workingStart: c.workingStart,
        workingEnd: c.workingEnd,
        dailyCapacity: c.dailyCapacity,
        assignedCount: 0,
      })),
      todayStr
    );

    // Persist to DB
    await prisma.planItem.deleteMany({});
    await prisma.dailyPlan.deleteMany({ where: { date: todayStr } });

    const createdPlan = await prisma.dailyPlan.create({
      data: {
        id: `PLAN-${todayStr}`,
        date: todayStr,
        status: 'GENERATED',
      },
    });

    for (const crewPlan of planResult.crewPlans) {
      for (const job of crewPlan.jobs) {
        await prisma.planItem.create({
          data: {
            id: `ITEM-${job.workOrderId}`,
            dailyPlanId: createdPlan.id,
            workOrderId: job.workOrderId,
            crewId: crewPlan.crewId,
            sequence: job.sequence,
            scheduledStart: job.scheduledStart,
            estimatedDuration: job.estimatedDuration,
            travelDistanceKm: job.travelDistanceKm,
            travelTimeMin: job.travelTimeMin,
            reason: job.reason,
          },
        });

        // Update WorkOrder assignedCrew & status
        await prisma.workOrder.update({
          where: { id: job.workOrderId },
          data: {
            assignedCrewId: crewPlan.crewId,
            status: 'SCHEDULED',
            scheduledAt: new Date(),
            sequence: job.sequence,
          },
        });

        // Update Complaint status
        const wo = await prisma.workOrder.findUnique({ where: { id: job.workOrderId } });
        if (wo) {
          await prisma.complaint.update({
            where: { id: wo.complaintId },
            data: { status: 'SCHEDULED' },
          });
        }
      }
    }

    res.json({
      success: true,
      message: "Daily work plan generated and persistent schedule saved",
      data: planResult,
    });
  } catch (error) {
    console.error('Error generating daily plan:', error);
    res.status(500).json({ success: false, message: 'Failed to generate daily plan' });
  }
}

export async function assignWorkOrderManual(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { crewId, overrideReason } = req.body;

    if (!crewId) {
      return res.status(400).json({ success: false, message: 'crewId is required' });
    }

    const workOrder = await prisma.workOrder.findFirst({
      where: { OR: [{ id }, { workOrderNumber: id }] },
    });

    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    const previousCrewId = workOrder.assignedCrewId;

    // Create AssignmentOverride audit trail record
    if (overrideReason) {
      await prisma.assignmentOverride.create({
        data: {
          workOrderId: workOrder.id,
          previousCrewId,
          newCrewId: crewId,
          reason: overrideReason,
        },
      });
    }

    // Update work order
    const updatedWO = await prisma.workOrder.update({
      where: { id: workOrder.id },
      data: {
        assignedCrewId: crewId,
        assignedAt: new Date(),
        status: 'ASSIGNED',
      },
      include: {
        assignedCrew: true,
        complaint: true,
      },
    });

    res.json({
      success: true,
      message: `Work order assigned to ${updatedWO.assignedCrew?.name}`,
      workOrder: updatedWO,
    });
  } catch (error) {
    console.error('Error manually assigning work order:', error);
    res.status(500).json({ success: false, message: 'Failed to assign work order' });
  }
}

export async function updateWorkOrderStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['PENDING', 'ASSIGNED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid status required' });
    }

    const workOrder = await prisma.workOrder.findFirst({
      where: { OR: [{ id }, { workOrderNumber: id }] },
    });

    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    const updateData: any = { status };
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    const updatedWO = await prisma.workOrder.update({
      where: { id: workOrder.id },
      data: updateData,
    });

    await prisma.complaint.update({
      where: { id: workOrder.complaintId },
      data: { status },
    });

    res.json({
      success: true,
      message: `Work order ${updatedWO.workOrderNumber} status updated to ${status}`,
      workOrder: updatedWO,
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: 'Failed to update work order status' });
  }
}
