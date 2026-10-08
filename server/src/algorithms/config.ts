export const PRIORITY_WEIGHTS = {
  severity: 0.40,
  exposure: 0.25,
  traffic: 0.20,
  age: 0.10,
  crewProximity: 0.05,
};

export const TRAFFIC_SCORES: Record<string, number> = {
  Residential: 30,
  Local: 45,
  Collector: 70,
  Arterial: 90,
};

export const PRIORITY_BANDS = {
  CRITICAL: { min: 80, max: 100, label: 'CRITICAL', color: '#EF4444' },
  HIGH: { min: 60, max: 79.99, label: 'HIGH', color: '#F97316' },
  MEDIUM: { min: 40, max: 59.99, label: 'MEDIUM', color: '#EAB308' },
  LOW: { min: 0, max: 39.99, label: 'LOW', color: '#22C55E' },
};
