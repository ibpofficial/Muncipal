import { PRIORITY_WEIGHTS } from './config';
import { calculateSeverity } from './severityEngine';
import { calculateExposure, RoadAssetData } from './exposureEngine';
import { calculateTrafficScore } from './trafficEngine';
import { calculateAgeScore } from './ageEngine';
import { calculateCrewProximity, CrewData } from './proximityEngine';

export interface ComplaintInput {
  id: string;
  description: string;
  latitude: number;
  longitude: number;
  roadType: string;
  reportedAt: Date | string;
}

export interface PriorityDecisionPayload {
  priorityScore: number;
  priorityBand: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  factors: {
    severity: number;
    exposure: number;
    traffic: number;
    age: number;
    crewProximity: number;
  };
  reasons: string[];
  recommendation: string;
  nearestCrewId?: string;
  nearbyAssets: { asset: RoadAssetData; distanceMeters: number }[];
}

export function calculatePriorityDecision(
  complaint: ComplaintInput,
  roadAssets: RoadAssetData[],
  crews: CrewData[]
): PriorityDecisionPayload {
  const severityRes = calculateSeverity(complaint.description);
  const exposureRes = calculateExposure(complaint.latitude, complaint.longitude, roadAssets);
  const trafficRes = calculateTrafficScore(complaint.roadType);
  const ageRes = calculateAgeScore(complaint.reportedAt);
  const proximityRes = calculateCrewProximity(complaint.latitude, complaint.longitude, crews);

  const rawScore =
    PRIORITY_WEIGHTS.severity * severityRes.score +
    PRIORITY_WEIGHTS.exposure * exposureRes.score +
    PRIORITY_WEIGHTS.traffic * trafficRes.score +
    PRIORITY_WEIGHTS.age * ageRes.score +
    PRIORITY_WEIGHTS.crewProximity * proximityRes.score;

  const priorityScore = Math.round(rawScore);

  let priorityBand: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  let recommendation = 'Schedule standard maintenance';

  if (priorityScore >= 80) {
    priorityBand = 'CRITICAL';
    recommendation = 'Repair today (Immediate Dispatch)';
  } else if (priorityScore >= 60) {
    priorityBand = 'HIGH';
    recommendation = 'Schedule within 24-48 hours';
  } else if (priorityScore >= 40) {
    priorityBand = 'MEDIUM';
    recommendation = 'Include in weekly patch schedule';
  } else {
    priorityBand = 'LOW';
    recommendation = 'Monitor condition during routine inspection';
  }

  const reasons: string[] = [];

  if (severityRes.reasons.length > 0) {
    reasons.push(severityRes.reasons[0]);
  } else {
    reasons.push(`${severityRes.severity.toLowerCase()} severity road surface issue`);
  }

  if (exposureRes.reasons.length > 0) {
    reasons.push(exposureRes.reasons[0]);
  }

  reasons.push(trafficRes.reason);
  reasons.push(ageRes.reason);
  reasons.push(proximityRes.reason);

  return {
    priorityScore,
    priorityBand,
    severity: severityRes.severity,
    factors: {
      severity: severityRes.score,
      exposure: exposureRes.score,
      traffic: trafficRes.score,
      age: ageRes.score,
      crewProximity: proximityRes.score,
    },
    reasons,
    recommendation,
    nearestCrewId: proximityRes.nearestCrewId,
    nearbyAssets: exposureRes.nearbyAssets,
  };
}
