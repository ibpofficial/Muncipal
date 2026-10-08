import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboardController';
import { getComplaints, getComplaintById, createComplaint, upvoteComplaint, addComment } from '../controllers/complaintController';
import { getWorkOrders, getWorkOrderById, recalculatePriority } from '../controllers/workOrderController';
import { getCrews } from '../controllers/crewController';
import { getMapWorkOrders } from '../controllers/mapController';
import {
  getDailyPlan,
  generateAndSaveDailyPlan,
  assignWorkOrderManual,
  updateWorkOrderStatus,
} from '../controllers/dailyPlanController';
import { syncUser, getCurrentUser } from '../controllers/authController';
import {
  getFieldTodayJobs,
  startWorkOrder,
  completeWorkOrder,
  uploadEvidence,
} from '../controllers/fieldController';
import {
  getOperationalAnalytics,
  getCrewAnalytics,
  getWardAnalytics,
  getHotspots,
  recalculateHotspots,
  getHotspotById,
} from '../controllers/analyticsController';
import {
  getRouteEstimateHandler,
  getDailyPlanRouteHandler,
} from '../controllers/routingController';

const router = Router();

// Auth Endpoints
router.post('/auth/sync-user', syncUser);
router.get('/auth/me', getCurrentUser);

// Dashboard Summary
router.get('/dashboard/summary', getDashboardSummary);

// Complaints REST Endpoints
router.get('/complaints', getComplaints);
router.get('/complaints/:id', getComplaintById);
router.post('/complaints', createComplaint);
router.post('/complaints/:id/upvote', upvoteComplaint);
router.post('/complaints/:id/comments', addComment);

// Work Orders REST Endpoints
router.get('/work-orders', getWorkOrders);
router.get('/work-orders/:id', getWorkOrderById);
router.post('/work-orders/:id/calculate-priority', recalculatePriority);
router.post('/work-orders/:id/assign', assignWorkOrderManual);
router.patch('/work-orders/:id/status', updateWorkOrderStatus);

// Execution & Evidence (Phase 3)
router.post('/work-orders/:id/start', startWorkOrder);
router.post('/work-orders/:id/complete', completeWorkOrder);
router.post('/work-orders/:id/evidence', uploadEvidence);

// Field Crew Workspace (Phase 3)
router.get('/field/today', getFieldTodayJobs);

// Daily Plan REST Endpoints
router.get('/daily-plan', getDailyPlan);
router.post('/daily-plan/generate', generateAndSaveDailyPlan);
router.get('/daily-plan/route', getDailyPlanRouteHandler);

// Crews REST Endpoints
router.get('/crews', getCrews);

// Map REST Endpoints
router.get('/map/work-orders', getMapWorkOrders);

// Routing Endpoints (Phase 3)
router.get('/routes/estimate', getRouteEstimateHandler);

// Operational Analytics Endpoints (Phase 3)
router.get('/analytics/operations', getOperationalAnalytics);
router.get('/analytics/crews', getCrewAnalytics);
router.get('/analytics/wards', getWardAnalytics);

// Hotspots Endpoints (Phase 3)
router.get('/hotspots', getHotspots);
router.post('/hotspots/recalculate', recalculateHotspots);
router.get('/hotspots/:id', getHotspotById);

export default router;
