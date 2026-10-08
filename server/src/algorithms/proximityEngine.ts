import { calculateDistanceMeters } from './exposureEngine';

export interface CrewData {
  id: string;
  name: string;
  currentLatitude: number;
  currentLongitude: number;
  availabilityStatus?: string;
  availability?: string;
  assignedCount: number;
  dailyCapacity: number;
  members?: number;
  specialization?: string;
}

export interface ProximityResult {
  score: number;
  nearestCrewId?: string;
  nearestCrewName?: string;
  distanceKm?: number;
  reason: string;
}

export function calculateCrewProximity(
  lat: number,
  lng: number,
  crews: CrewData[]
): ProximityResult {
  const availableCrews = crews.filter(
    (c) => c.availability === 'AVAILABLE' && c.assignedCount < c.dailyCapacity
  );

  if (availableCrews.length === 0) {
    return {
      score: 0,
      reason: 'No available repair crew in duty zone',
    };
  }

  let minDistanceMeters = Infinity;
  let nearestCrew: CrewData | null = null;

  for (const crew of availableCrews) {
    const dist = calculateDistanceMeters(lat, lng, crew.currentLatitude, crew.currentLongitude);
    if (dist < minDistanceMeters) {
      minDistanceMeters = dist;
      nearestCrew = crew;
    }
  }

  const distanceKm = Math.round((minDistanceMeters / 1000) * 10) / 10;

  let score = 25;
  let reason = `Nearest available crew (${nearestCrew?.name}) > 10 km away`;

  if (distanceKm < 2.0) {
    score = 100;
    reason = `Suitable crew (${nearestCrew?.name}) available nearby (${distanceKm} km)`;
  } else if (distanceKm <= 5.0) {
    score = 75;
    reason = `Crew (${nearestCrew?.name}) located within ${distanceKm} km`;
  } else if (distanceKm <= 10.0) {
    score = 50;
    reason = `Nearest crew (${nearestCrew?.name}) ${distanceKm} km away`;
  }

  return {
    score,
    nearestCrewId: nearestCrew?.id,
    nearestCrewName: nearestCrew?.name,
    distanceKm,
    reason,
  };
}
