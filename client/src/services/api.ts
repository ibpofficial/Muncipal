import { auth } from '../firebase';
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
  AuditLog,
  UserRole,
} from '../types';

const API_BASE = '/api';

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      headers.set('Authorization', `Bearer ${token}`);
    } catch (err) {
      console.warn('[API Auth Warning] Failed to get Firebase ID token:', err);
    }
  }

  let response = await fetch(url, { ...options, headers });

  // Handle expired token retry once
  if (response.status === 401 && auth.currentUser) {
    try {
      const freshToken = await auth.currentUser.getIdToken(true);
      headers.set('Authorization', `Bearer ${freshToken}`);
      response = await fetch(url, { ...options, headers });
    } catch (refreshErr) {
      console.error('[API Auth Error] Token refresh failed, signing out:', refreshErr);
      await auth.signOut();
    }
  }

  return response;
}

// ---------------- AUTH API ----------------

export async function registerUserApi(payload: any): Promise<{ success: boolean; user: User; message?: string }> {
  const res = await authFetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Registration failed');
  return json;
}

export async function syncUserApi(userPayload: {
  firebaseUid?: string;
  email: string;
  name?: string;
  photoUrl?: string;
  emailVerified?: boolean;
}): Promise<User> {
  const res = await authFetch(`${API_BASE}/auth/sync-user`, {
    method: 'POST',
    body: JSON.stringify(userPayload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to sync user');
  return json.user;
}

export async function fetchCurrentUser(): Promise<User | null> {
  const res = await authFetch(`${API_BASE}/auth/me`);
  if (!res.ok) return null;
  const json = await res.json();
  return json.user || null;
}

export async function logoutUserApi(): Promise<void> {
  await authFetch(`${API_BASE}/auth/logout`, { method: 'POST' });
}

export async function requestRoleUpgradeApi(requestedRole: UserRole) {
  const res = await authFetch(`${API_BASE}/auth/request-role`, {
    method: 'POST',
    body: JSON.stringify({ requestedRole }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to request role upgrade');
  return json;
}

export async function fetchApprovalsApi(): Promise<User[]> {
  const res = await authFetch(`${API_BASE}/approvals`);
  if (!res.ok) throw new Error('Failed to fetch pending approvals');
  const json = await res.json();
  return json.data;
}

export async function updateApprovalApi(userId: string, status: 'APPROVED' | 'REJECTED', approvedRole?: UserRole) {
  const res = await authFetch(`${API_BASE}/approvals/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, approvedRole }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to update approval');
  return json;
}

export async function updateUserStatusApi(userId: string, status: string) {
  const res = await authFetch(`${API_BASE}/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to update user status');
  return json;
}

export async function updateUserCrewApi(userId: string, crewId: string | null) {
  const res = await authFetch(`${API_BASE}/users/${userId}/crew`, {
    method: 'PATCH',
    body: JSON.stringify({ crewId }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to update crew assignment');
  return json;
}

export async function fetchMyActivityApi(): Promise<AuditLog[]> {
  const res = await authFetch(`${API_BASE}/me/activity`);
  if (!res.ok) throw new Error('Failed to fetch activity log');
  const json = await res.json();
  return json.data;
}

export async function fetchAuditLogApi(params?: { userId?: string; role?: string; action?: string; search?: string }): Promise<AuditLog[]> {
  const query = new URLSearchParams(params as any).toString();
  const res = await authFetch(`${API_BASE}/audit-log?${query}`);
  if (!res.ok) throw new Error('Failed to fetch system audit logs');
  const json = await res.json();
  return json.data;
}

// ---------------- PUBLIC API ----------------

export async function fetchPublicComplaintsApi(): Promise<Complaint[]> {
  const res = await fetch(`${API_BASE}/public/complaints`);
  if (!res.ok) throw new Error('Failed to fetch public complaints');
  const json = await res.json();
  return json.data;
}

// ---------------- DASHBOARD & OPERATIONAL APIs ----------------

export async function fetchDashboardSummary(): Promise<DashboardSummaryResponse> {
  const res = await authFetch(`${API_BASE}/dashboard/summary`);
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
  const res = await authFetch(`${API_BASE}/work-orders?${query}`);
  if (!res.ok) throw new Error('Failed to fetch work orders');
  const json = await res.json();
  return json.data;
}

export async function fetchWorkOrderById(id: string): Promise<WorkOrder> {
  const res = await authFetch(`${API_BASE}/work-orders/${id}`);
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
  const res = await authFetch(`${API_BASE}/complaints?${query}`);
  if (!res.ok) throw new Error('Failed to fetch complaints');
  const json = await res.json();
  return json.data;
}

export async function fetchComplaintById(id: string): Promise<Complaint> {
  const res = await authFetch(`${API_BASE}/complaints/${id}`);
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
  const res = await authFetch(`${API_BASE}/complaints`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorJson = await res.json();
    throw new Error(errorJson.message || 'Failed to submit complaint');
  }
  return res.json();
}

export async function upvoteComplaintApi(id: string) {
  const res = await authFetch(`${API_BASE}/complaints/${id}/upvote`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to upvote complaint');
  return res.json();
}

export async function addCommentApi(id: string, text: string) {
  const res = await authFetch(`${API_BASE}/complaints/${id}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('Failed to add comment');
  return res.json();
}

export async function fetchCrews(): Promise<Crew[]> {
  const res = await authFetch(`${API_BASE}/crews`);
  if (!res.ok) throw new Error('Failed to fetch crews');
  const json = await res.json();
  return json.data;
}

export async function fetchMapWorkOrders(): Promise<{
  workOrders: MapWorkOrder[];
  assets: RoadAsset[];
  crews: Crew[];
}> {
  const res = await authFetch(`${API_BASE}/map/work-orders`);
  if (!res.ok) throw new Error('Failed to fetch map work orders');
  const json = await res.json();
  return {
    workOrders: json.workOrders,
    assets: json.assets,
    crews: json.crews,
  };
}

export async function fetchDailyPlan(): Promise<DailyPlanResponse> {
  const res = await authFetch(`${API_BASE}/daily-plan`);
  if (!res.ok) throw new Error('Failed to fetch daily work plan');
  return res.json();
}

export async function generateDailyPlanApi(): Promise<DailyPlanResponse> {
  const res = await authFetch(`${API_BASE}/daily-plan/generate`, {
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
  const res = await authFetch(`${API_BASE}/work-orders/${id}/assign`, {
    method: 'POST',
    body: JSON.stringify({ crewId, overrideReason }),
  });
  if (!res.ok) throw new Error('Failed to assign work order');
  return res.json();
}

export async function updateWorkOrderStatusApi(id: string, status: string) {
  const res = await authFetch(`${API_BASE}/work-orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

export async function fetchFieldTodayJobs(): Promise<FieldTodayResponse['data']> {
  const res = await authFetch(`${API_BASE}/field/today`);
  if (!res.ok) throw new Error("Failed to fetch today's field crew jobs");
  const json = await res.json();
  return json.data;
}

export async function startWorkOrderApi(id: string): Promise<WorkOrder> {
  const res = await authFetch(`${API_BASE}/work-orders/${id}/start`, {
    method: 'POST',
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
  const res = await authFetch(`${API_BASE}/work-orders/${id}/complete`, {
    method: 'POST',
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
  const res = await authFetch(`${API_BASE}/work-orders/${id}/evidence`, {
    method: 'POST',
    body: JSON.stringify({ type, url }),
  });
  if (!res.ok) throw new Error('Failed to upload evidence');
  return res.json();
}

export async function fetchOperationalAnalytics(): Promise<OperationalAnalyticsData> {
  const res = await authFetch(`${API_BASE}/analytics/operations`);
  if (!res.ok) throw new Error('Failed to fetch operational analytics');
  const json = await res.json();
  return json.data;
}

export async function fetchCrewAnalytics(): Promise<CrewAnalyticsItem[]> {
  const res = await authFetch(`${API_BASE}/analytics/crews`);
  if (!res.ok) throw new Error('Failed to fetch crew analytics');
  const json = await res.json();
  return json.data;
}

export async function fetchWardAnalytics(): Promise<WardAnalyticsItem[]> {
  const res = await authFetch(`${API_BASE}/analytics/wards`);
  if (!res.ok) throw new Error('Failed to fetch ward analytics');
  const json = await res.json();
  return json.data;
}

export async function fetchHotspots(): Promise<RoadHotspot[]> {
  const res = await authFetch(`${API_BASE}/hotspots`);
  if (!res.ok) throw new Error('Failed to fetch hotspots');
  const json = await res.json();
  return json.data;
}

export async function recalculateHotspotsApi(): Promise<RoadHotspot[]> {
  const res = await authFetch(`${API_BASE}/hotspots/recalculate`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to recalculate hotspots');
  const json = await res.json();
  return json.data;
}

export async function fetchDailyPlanRoute(crewId?: string) {
  const param = crewId ? `?crewId=${crewId}` : '';
  const res = await authFetch(`${API_BASE}/daily-plan/route${param}`);
  if (!res.ok) throw new Error('Failed to fetch plan route geometry');
  const json = await res.json();
  return json.data;
}
