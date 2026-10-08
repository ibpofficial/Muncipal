import {
  DashboardSummaryResponse,
  WorkOrder,
  Complaint,
  Crew,
  MapWorkOrder,
  RoadAsset,
  DailyPlanResponse,
  FieldTodayResponse,
  OperationalAnalyticsData,
  CrewAnalyticsItem,
  WardAnalyticsItem,
  RoadHotspot,
  User,
} from '../types';

const API_BASE = '/api';

export async function fetchDashboardSummary(): Promise<DashboardSummaryResponse> {
  const res = await fetch(`${API_BASE}/dashboard/summary`);
  if (!res.ok) throw new Error('Failed to fetch dashboard summary');
  return res.json();
}

export async function fetchWorkOrders(params?: {
  priorityBand?: string;
  status?: string;
  wardId?: string;
  search?: string;
}): Promise<WorkOrder[]> {
  const query = new URLSearchParams(params as any).toString();
  const res = await fetch(`${API_BASE}/work-orders?${query}`);
  if (!res.ok) throw new Error('Failed to fetch work orders');
  const json = await res.json();
  return json.data;
}

export async function fetchWorkOrderById(id: string): Promise<WorkOrder> {
  const res = await fetch(`${API_BASE}/work-orders/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch work order #${id}`);
  const json = await res.json();
  return json.data;
}

export async function fetchComplaints(params?: {
  wardId?: string;
  priorityBand?: string;
  status?: string;
  search?: string;
}): Promise<Complaint[]> {
  const query = new URLSearchParams(params as any).toString();
  const res = await fetch(`${API_BASE}/complaints?${query}`);
  if (!res.ok) throw new Error('Failed to fetch complaints');
  const json = await res.json();
  return json.data;
}

export async function fetchComplaintById(id: string): Promise<Complaint> {
  const res = await fetch(`${API_BASE}/complaints/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch complaint #${id}`);
  const json = await res.json();
  return json.data;
}

export async function createComplaintApi(payload: {
  description: string;
  latitude: number;
  longitude: number;
  roadType: string;
  wardId: string;
  photoUrl?: string;
}) {
  const res = await fetch(`${API_BASE}/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorJson = await res.json();
    throw new Error(errorJson.message || 'Failed to submit complaint');
  }
  return res.json();
}

export async function upvoteComplaintApi(id: string) {
  const res = await fetch(`${API_BASE}/complaints/${id}/upvote`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to upvote complaint');
  return res.json();
}

export async function addCommentApi(id: string, text: string, authorName: string = 'Citizen') {
  const res = await fetch(`${API_BASE}/complaints/${id}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, authorName }),
  });
  if (!res.ok) throw new Error('Failed to add comment');
  return res.json();
}

export async function fetchCrews(): Promise<Crew[]> {
  const res = await fetch(`${API_BASE}/crews`);
  if (!res.ok) throw new Error('Failed to fetch crews');
  const json = await res.json();
  return json.data;
}

export async function fetchMapWorkOrders(): Promise<{
  workOrders: MapWorkOrder[];
  assets: RoadAsset[];
  crews: Crew[];
}> {
  const res = await fetch(`${API_BASE}/map/work-orders`);
  if (!res.ok) throw new Error('Failed to fetch map work orders');
  const json = await res.json();
  return {
    workOrders: json.workOrders,
    assets: json.assets,
    crews: json.crews,
  };
}

export async function fetchDailyPlan(): Promise<DailyPlanResponse> {
  const res = await fetch(`${API_BASE}/daily-plan`);
  if (!res.ok) throw new Error('Failed to fetch daily work plan');
  return res.json();
}

export async function generateDailyPlanApi(): Promise<DailyPlanResponse> {
  const res = await fetch(`${API_BASE}/daily-plan/generate`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to generate daily plan');
  return res.json();
}

export async function assignWorkOrderManualApi(
  id: string,
  crewId: string,
  overrideReason?: string
) {
  const res = await fetch(`${API_BASE}/work-orders/${id}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ crewId, overrideReason }),
  });
  if (!res.ok) throw new Error('Failed to assign work order');
  return res.json();
}

export async function updateWorkOrderStatusApi(id: string, status: string) {
  const res = await fetch(`${API_BASE}/work-orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

// Phase 3 Field Crew APIs
export async function fetchFieldTodayJobs(crewId: string = 'CREW-01'): Promise<FieldTodayResponse['data']> {
  const res = await fetch(`${API_BASE}/field/today?crewId=${crewId}`, {
    headers: { 'x-crew-id': crewId },
  });
  if (!res.ok) throw new Error("Failed to fetch today's field crew jobs");
  const json = await res.json();
  return json.data;
}

export async function startWorkOrderApi(id: string): Promise<WorkOrder> {
  const res = await fetch(`${API_BASE}/work-orders/${id}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to start job');
  const json = await res.json();
  return json.workOrder;
}

export async function completeWorkOrderApi(
  id: string,
  completionNotes: string,
  afterPhotoUrl?: string
): Promise<WorkOrder> {
  const res = await fetch(`${API_BASE}/work-orders/${id}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completionNotes, afterPhotoUrl }),
  });
  if (!res.ok) throw new Error('Failed to complete job');
  const json = await res.json();
  return json.workOrder;
}

export async function uploadEvidenceApi(
  id: string,
  type: 'BEFORE' | 'AFTER',
  url: string
) {
  const res = await fetch(`${API_BASE}/work-orders/${id}/evidence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, url }),
  });
  if (!res.ok) throw new Error('Failed to upload evidence');
  return res.json();
}

// Phase 3 Analytics & Hotspot APIs
export async function fetchOperationalAnalytics(): Promise<OperationalAnalyticsData> {
  const res = await fetch(`${API_BASE}/analytics/operations`);
  if (!res.ok) throw new Error('Failed to fetch operational analytics');
  const json = await res.json();
  return json.data;
}

export async function fetchCrewAnalytics(): Promise<CrewAnalyticsItem[]> {
  const res = await fetch(`${API_BASE}/analytics/crews`);
  if (!res.ok) throw new Error('Failed to fetch crew analytics');
  const json = await res.json();
  return json.data;
}

export async function fetchWardAnalytics(): Promise<WardAnalyticsItem[]> {
  const res = await fetch(`${API_BASE}/analytics/wards`);
  if (!res.ok) throw new Error('Failed to fetch ward analytics');
  const json = await res.json();
  return json.data;
}

export async function fetchHotspots(): Promise<RoadHotspot[]> {
  const res = await fetch(`${API_BASE}/hotspots`);
  if (!res.ok) throw new Error('Failed to fetch hotspots');
  const json = await res.json();
  return json.data;
}

export async function recalculateHotspotsApi(): Promise<RoadHotspot[]> {
  const res = await fetch(`${API_BASE}/hotspots/recalculate`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to recalculate hotspots');
  const json = await res.json();
  return json.data;
}

export async function fetchDailyPlanRoute(crewId: string = 'CREW-01') {
  const res = await fetch(`${API_BASE}/daily-plan/route?crewId=${crewId}`);
  if (!res.ok) throw new Error('Failed to fetch plan route geometry');
  const json = await res.json();
  return json.data;
}

// Phase 3 User Auth APIs
export async function syncUserApi(userPayload: {
  firebaseUid?: string;
  email: string;
  name?: string;
  role?: string;
  crewId?: string;
}): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/sync-user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userPayload),
  });
  if (!res.ok) throw new Error('Failed to sync user');
  const json = await res.json();
  return json.user;
}

export async function fetchCurrentUser(roleHeader?: string, crewIdHeader?: string): Promise<User> {
  const headers: Record<string, string> = {};
  if (roleHeader) headers['x-user-role'] = roleHeader;
  if (crewIdHeader) headers['x-crew-id'] = crewIdHeader;

  const res = await fetch(`${API_BASE}/auth/me`, { headers });
  if (!res.ok) throw new Error('Failed to fetch current user');
  const json = await res.json();
  return json.user;
}
