import {
  DashboardSummaryResponse,
  WorkOrder,
  Complaint,
  Crew,
  MapWorkOrder,
  RoadAsset,
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
