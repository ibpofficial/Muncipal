import { TRAFFIC_SCORES } from './config';

export interface TrafficResult {
  score: number;
  reason: string;
}

export function calculateTrafficScore(roadType: string): TrafficResult {
  const normalizedType = roadType.charAt(0).toUpperCase() + roadType.slice(1).toLowerCase();
  const score = TRAFFIC_SCORES[normalizedType] ?? 40;

  let reason = `${normalizedType} road network corridor`;
  if (normalizedType === 'Arterial') {
    reason = 'High-density arterial thoroughfare';
  } else if (normalizedType === 'Collector') {
    reason = 'Major feeder/collector roadway';
  } else if (normalizedType === 'Local') {
    reason = 'Local municipal connecting road';
  } else if (normalizedType === 'Residential') {
    reason = 'Low-speed residential street';
  }

  return { score, reason };
}
