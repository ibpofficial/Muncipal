import { calculateDistanceMeters } from './exposureEngine';

export interface CrewAssignmentInput {
  id: string;
  name: string;
  specialization: string;
  currentLatitude: number;
  currentLongitude: number;
  availabilityStatus: string;
  workingStart: string;
  workingEnd: string;
  dailyCapacity: number;
  assignedCount: number;
}

export interface WorkOrderAssignmentInput {
  id: string;
  workOrderNumber: string;
  priorityScore: number;
  severity: string;
  roadType: string;
  latitude: number;
  longitude: number;
  estimatedDuration: number; // in minutes
  description: string;
}

export interface CrewSuitabilityResult {
  crewId: string;
  crewName: string;
  suitabilityScore: number;
  eligible: boolean;
  distanceKm: number;
  travelTimeMin: number;
  reasons: string[];
}

export function evaluateCrewSuitability(
  workOrder: WorkOrderAssignmentInput,
  crew: CrewAssignmentInput,
  lastLocation?: { lat: number; lng: number }
): CrewSuitabilityResult {
  const reasons: string[] = [];

  // 1. Check availability
  if (crew.availabilityStatus === 'OFFLINE' || crew.availabilityStatus === 'BUSY') {
    return {
      crewId: crew.id,
      crewName: crew.name,
      suitabilityScore: 0,
      eligible: false,
      distanceKm: 0,
      travelTimeMin: 0,
      reasons: [`Crew ${crew.name} is currently ${crew.availabilityStatus.toLowerCase()}`],
    };
  }

  // 2. Check capacity
  if (crew.assignedCount >= crew.dailyCapacity) {
    return {
      crewId: crew.id,
      crewName: crew.name,
      suitabilityScore: 0,
      eligible: false,
      distanceKm: 0,
      travelTimeMin: 0,
      reasons: [`Crew ${crew.name} has reached maximum daily capacity (${crew.dailyCapacity} jobs)`],
    };
  }

  // 3. Distance calculation from last known location or current location
  const startLat = lastLocation ? lastLocation.lat : crew.currentLatitude;
  const startLng = lastLocation ? lastLocation.lng : crew.currentLongitude;

  const distMeters = calculateDistanceMeters(startLat, startLng, workOrder.latitude, workOrder.longitude);
  const distanceKm = Math.round((distMeters / 1000) * 10) / 10;
  // Estimate travel time: ~3 mins per km + 5 mins buffer
  const travelTimeMin = Math.round(distanceKm * 3) + 5;

  // 4. Scoring factors
  // Factor A: Distance Efficiency (40% weight) -> 100 at 0km down to 0 at 20km
  const distanceScore = Math.max(0, Math.round(100 - distanceKm * 5));

  // Factor B: Skill Match (30% weight)
  let skillScore = 70; // baseline
  const desc = workOrder.description.toLowerCase();

  if (crew.specialization.toLowerCase().includes('asphalt') && (desc.includes('pothole') || desc.includes('asphalt') || desc.includes('surface'))) {
    skillScore = 100;
    reasons.push(`Specialization (${crew.specialization}) matches surface damage`);
  } else if (crew.specialization.toLowerCase().includes('general') || crew.specialization.toLowerCase().includes('maintenance')) {
    skillScore = 85;
    reasons.push(`General maintenance capability suitable for job`);
  } else {
    skillScore = 60;
    reasons.push(`General crew assigned`);
  }

  // Factor C: Remaining Capacity (20% weight)
  const capacityScore = Math.round(((crew.dailyCapacity - crew.assignedCount) / crew.dailyCapacity) * 100);
  reasons.push(`${crew.dailyCapacity - crew.assignedCount} capacity slots remaining`);

  // Factor D: Workload Balance (10% weight) -> rewards lower assignedCount
  const workloadScore = Math.max(0, 100 - crew.assignedCount * 25);

  const suitabilityScore = Math.round(
    0.40 * distanceScore +
    0.30 * skillScore +
    0.20 * capacityScore +
    0.10 * workloadScore
  );

  if (distanceKm <= 5.0) {
    reasons.unshift(`${distanceKm} km travel distance from current position`);
  } else {
    reasons.unshift(`${distanceKm} km travel distance`);
  }

  return {
    crewId: crew.id,
    crewName: crew.name,
    suitabilityScore,
    eligible: true,
    distanceKm,
    travelTimeMin,
    reasons,
  };
}
