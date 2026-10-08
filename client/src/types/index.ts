export type PriorityBand = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type WorkOrderStatus = 'PENDING' | 'ASSIGNED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
export type RoadType = 'Residential' | 'Local' | 'Collector' | 'Arterial';
export type UserRole = 'OFFICER' | 'SUPERVISOR' | 'FIELD_CREW';

export interface User {
  id: string;
  firebaseUid: string;
  name: string;
  email: string;
  role: UserRole;
  crewId?: string | null;
  crew?: Crew;
}

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
  availabilityStatus: 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'ON_BREAK' | 'FULL';
  workingStart: string;
  workingEnd: string;
  dailyCapacity: number;
  todayAssignedJobs?: number;
}

export interface PhotoEvidence {
  id: string;
  workOrderId: string;
  type: 'COMPLAINT' | 'BEFORE' | 'AFTER';
  url: string;
  storagePath?: string | null;
  uploadedBy?: string | null;
  createdAt: string;
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
  estimatedDuration: number;
  actualStartTime?: string | null;
  actualCompletedTime?: string | null;
  actualDuration?: number | null;
  completionNotes?: string | null;
  sequence?: number;
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
  evidencePhotos?: PhotoEvidence[];
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

export interface RoadHotspot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  complaintCount: number;
  averageSeverity: string;
  highestPriority: number;
  wardId: string;
  ward?: Ward;
  lastReportedAt: string;
  createdAt: string;
}

export interface FieldJob {
  planItemId: string;
  sequence: number;
  scheduledStart: string;
  estimatedDuration: number;
  travelDistanceKm: number;
  travelTimeMin: number;
  workOrder: WorkOrder;
}

export interface FieldTodayResponse {
  success: boolean;
  data: {
    crew: Crew;
    date: string;
    totalJobs: number;
    completedJobs: number;
    remainingJobs: number;
    nextJob: FieldJob | null;
    jobs: FieldJob[];
  };
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

export interface ScheduledJobItem {
  workOrderId: string;
  workOrderNumber: string;
  sequence: number;
  scheduledStart: string;
  scheduledEnd: string;
  estimatedDuration: number;
  travelDistanceKm: number;
  travelTimeMin: number;
  priorityScore: number;
  priorityBand: PriorityBand;
  severity: SeverityLevel;
  roadType: string;
  description: string;
  wardName: string;
  latitude: number;
  longitude: number;
  suitabilityScore: number;
  reason: string;
}

export interface CrewPlan {
  crewId: string;
  crewName: string;
  specialization: string;
  availabilityStatus: string;
  currentLatitude: number;
  currentLongitude: number;
  dailyCapacity: number;
  assignedCount: number;
  capacityUtilizationPercent: number;
  totalTravelDistanceKm: number;
  totalTravelTimeMin: number;
  totalWorkTimeMin: number;
  totalFieldTimeFormatted: string;
  jobs: ScheduledJobItem[];
}

export interface UnscheduledItem {
  workOrderId: string;
  workOrderNumber: string;
  priorityScore: number;
  priorityBand: PriorityBand;
  description: string;
  roadType: string;
  wardName: string;
  reason: string;
}

export interface DailyPlanResponse {
  success: boolean;
  message?: string;
  data: {
    date: string;
    summary: {
      totalJobsPlanned: number;
      crewsUsed: number;
      totalTravelKm: number;
      totalFieldTimeFormatted: string;
      capacityUtilizationPercent: number;
      unscheduledCount: number;
    };
    crewPlans: CrewPlan[];
    remainingQueue: UnscheduledItem[];
    planReasons: string[];
  };
}

export interface OperationalAnalyticsData {
  summary: {
    totalComplaints: number;
    totalWorkOrders: number;
    completedJobs: number;
    pendingJobs: number;
    scheduledJobs: number;
    criticalCompleted: number;
    avgEstimatedDuration: number;
    avgActualDuration: number;
    durationDifference: number;
    totalTravelDistanceKm: number;
    avgTravelDistanceKm: number;
    hotspotCount: number;
  };
  insights: string[];
}

export interface CrewAnalyticsItem {
  id: string;
  name: string;
  specialization: string;
  members: number;
  dailyCapacity: number;
  jobsAssigned: number;
  jobsCompleted: number;
  jobsRemaining: number;
  completionRate: number;
  avgRepairDuration: number;
  avgTravelKm: number;
  capacityUtilization: number;
}

export interface WardAnalyticsItem {
  id: string;
  name: string;
  zone: string;
  population: number;
  areaKm2: number;
  totalComplaints: number;
  criticalCount: number;
  highCount: number;
  completed: number;
  pending: number;
  avgPriority: number;
  avgRepairTime: number;
  hotspotCount: number;
}
