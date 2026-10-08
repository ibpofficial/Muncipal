export type PriorityBand = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type WorkOrderStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
export type RoadType = 'Residential' | 'Local' | 'Collector' | 'Arterial';

export interface Ward {
  id: string;
  name: string;
  zone: string;
  population: number;
  areaKm2: number;
}

export interface RoadAsset {
  id: string;
  type: string;
  name: string;
  latitude: number;
  longitude: number;
  importance: number;
  wardId: string;
}

export interface Crew {
  id: string;
  name: string;
  members: number;
  specialization: string;
  currentLatitude: number;
  currentLongitude: number;
  availability: 'AVAILABLE' | 'BUSY' | 'OFF_DUTY';
  dailyCapacity: number;
  todayAssignedJobs: number;
}

export interface Complaint {
  id: string;
  ticketNumber: string;
  description: string;
  photoUrl?: string;
  latitude: number;
  longitude: number;
  wardId: string;
  roadType: RoadType;
  reportedAt: string;
  status: WorkOrderStatus;
  ward?: Ward;
  workOrder?: WorkOrder;
}

export interface WorkOrder {
  id: string;
  dbId?: string;
  workOrderNumber: string;
  complaintId: string;
  severity: SeverityLevel;
  severityScore: number;
  exposureScore: number;
  trafficScore: number;
  ageScore: number;
  crewProximityScore: number;
  priorityScore: number;
  priorityBand: PriorityBand;
  assignedCrewId?: string;
  assignedCrew?: Crew;
  scheduledDate?: string;
  status: WorkOrderStatus;
  factors: {
    severity: number;
    exposure: number;
    traffic: number;
    age: number;
    crewProximity: number;
  };
  reasons: string[];
  recommendation: string;
  complaint: Complaint;
  nearbyAssets?: { asset: RoadAsset; distanceMeters: number }[];
}

export interface MapWorkOrder {
  workOrderId: string;
  dbId: string;
  ticketNumber: string;
  latitude: number;
  longitude: number;
  priorityScore: number;
  priorityBand: PriorityBand;
  severity: SeverityLevel;
  roadType: string;
  description: string;
  wardName: string;
  fullWardName: string;
  status: WorkOrderStatus;
  reportedAt: string;
}

export interface DashboardKPIs {
  totalComplaints: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  pending: number;
  activeCrews: number;
}

export interface DashboardSummaryResponse {
  success: boolean;
  kpis: DashboardKPIs;
  charts: {
    byPriority: { name: string; count: number; color: string }[];
    byWard: { wardId: string; wardName: string; fullTitle: string; count: number }[];
    byStatus: { name: string; count: number }[];
  };
}
