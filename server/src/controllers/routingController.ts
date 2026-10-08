import { Request, Response } from 'express';
import { getRouteEstimate, getDailyPlanRouteGeometry } from '../services/routingService';
import { prisma } from '../db/prisma';

export async function getRouteEstimateHandler(req: Request, res: Response) {
  try {
    const originLat = parseFloat(req.query.originLat as string);
    const originLon = parseFloat(req.query.originLon as string);
    const destLat = parseFloat(req.query.destLat as string);
    const destLon = parseFloat(req.query.destLon as string);

    if (isNaN(originLat) || isNaN(originLon) || isNaN(destLat) || isNaN(destLon)) {
      return res.status(400).json({ success: false, message: 'Valid originLat, originLon, destLat, and destLon parameters are required' });
    }

    const route = await getRouteEstimate(originLat, originLon, destLat, destLon);

    res.json({
      success: true,
      data: route,
    });
  } catch (error) {
    console.error('Error estimating route:', error);
    res.status(500).json({ success: false, message: 'Failed to estimate route' });
  }
}

export async function getDailyPlanRouteHandler(req: Request, res: Response) {
  try {
    const crewId = (req.query.crewId as string) || 'CREW-01';

    const crew = await prisma.crew.findUnique({ where: { id: crewId } });
    if (!crew) {
      return res.status(404).json({ success: false, message: 'Crew not found' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const planItems = await (prisma as any).planItem.findMany({
      where: { crewId },
      include: {
        workOrder: {
          include: { complaint: true },
        },
      },
      orderBy: { sequence: 'asc' },
    });

    if (planItems.length === 0) {
      return res.json({
        success: true,
        data: {
          crewId,
          totalDistanceKm: 0,
          totalDurationMinutes: 0,
          stops: [],
          geometries: [],
        },
      });
    }

    const stops = [
      { lat: crew.currentLatitude, lon: crew.currentLongitude, name: `${crew.name} Depot` },
      ...planItems.map((item: any) => ({
        lat: item.workOrder.complaint.latitude,
        lon: item.workOrder.complaint.longitude,
        name: item.workOrder.workOrderNumber,
        road: item.workOrder.complaint.description,
      })),
    ];

    const routeData = await getDailyPlanRouteGeometry(stops);

    res.json({
      success: true,
      data: {
        crewId,
        stops,
        ...routeData,
      },
    });
  } catch (error) {
    console.error('Error fetching daily plan route:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch daily plan route' });
  }
}
