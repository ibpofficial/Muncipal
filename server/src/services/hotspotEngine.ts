import { prisma } from '../db/prisma';

interface GeoPoint {
  id: string;
  latitude: number;
  longitude: number;
  reportedAt: Date;
  severity: string;
  priorityScore: number;
  wardId: string;
  roadName: string;
}

// Calculate Haversine distance in meters
function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function detectAndSaveHotspots() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 60); // 60 days window for demo richness

  const complaints = await prisma.complaint.findMany({
    where: {
      reportedAt: { gte: cutoffDate },
    },
    include: {
      workOrder: true,
      ward: true,
    },
  });

  const points: GeoPoint[] = complaints.map((c) => ({
    id: c.id,
    latitude: c.latitude,
    longitude: c.longitude,
    reportedAt: c.reportedAt,
    severity: c.workOrder?.severity || 'MEDIUM',
    priorityScore: c.workOrder?.priorityScore || 50,
    wardId: c.wardId,
    roadName: c.description.split('near')[0].replace('Pothole on', '').replace('Road damage at', '').trim(),
  }));

  // Greedy clustering based on 150m radius threshold
  const RADIUS_METERS = 150;
  const MIN_COMPLAINTS = 2; // threshold for demo hotspot

  const visited = new Set<string>();
  const clusters: GeoPoint[][] = [];

  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    if (visited.has(p1.id)) continue;

    const cluster: GeoPoint[] = [p1];
    visited.add(p1.id);

    for (let j = i + 1; j < points.length; j++) {
      const p2 = points[j];
      if (visited.has(p2.id)) continue;

      const dist = haversineDistanceMeters(p1.latitude, p1.longitude, p2.latitude, p2.longitude);
      if (dist <= RADIUS_METERS) {
        cluster.push(p2);
        visited.add(p2.id);
      }
    }

    if (cluster.length >= MIN_COMPLAINTS) {
      clusters.push(cluster);
    }
  }

  // Clear existing hotspots
  await (prisma as any).roadHotspot.deleteMany({});

  const savedHotspots = [];

  for (let i = 0; i < clusters.length; i++) {
    const cl = clusters[i];
    const avgLat = cl.reduce((acc, p) => acc + p.latitude, 0) / cl.length;
    const avgLon = cl.reduce((acc, p) => acc + p.longitude, 0) / cl.length;

    const highestPriority = Math.max(...cl.map((p) => p.priorityScore));
    const severities = cl.map((p) => p.severity);
    const avgSeverity = severities.includes('CRITICAL')
      ? 'CRITICAL'
      : severities.includes('HIGH')
      ? 'HIGH'
      : 'MEDIUM';

    const lastReported = new Date(Math.max(...cl.map((p) => new Date(p.reportedAt).getTime())));
    const primaryWardId = cl[0].wardId;
    const roadName = cl[0].roadName || 'Municipal Road';

    const hotspot = await (prisma as any).roadHotspot.create({
      data: {
        id: `HOTSPOT-${i + 1}`,
        name: `Recurring Hotspot - ${roadName}`,
        latitude: avgLat,
        longitude: avgLon,
        radius: RADIUS_METERS,
        complaintCount: cl.length,
        averageSeverity: avgSeverity,
        highestPriority,
        wardId: primaryWardId,
        lastReportedAt: lastReported,
      },
    });

    savedHotspots.push(hotspot);
  }

  return savedHotspots;
}
