import { Router } from 'express';
import {
  firebaseAuthMiddleware,
  requireAuth,
  requireVerifiedEmail,
  requireActiveAccount,
  requireRole,
} from '../middleware/auth';
import {
  registerUser,
  syncUser,
  getCurrentUser,
  getUserPermissions,
  logoutUser,
  requestRoleUpgrade,
  getApprovals,
  updateApprovalStatus,
  updateUserStatus,
  updateUserCrew,
  getUserActivity,
  getFullAuditLog,
} from '../controllers/authController';
import { getDashboardSummary } from '../controllers/dashboardController';
import {
  getComplaints,
  getComplaintById,
  createComplaint,
  upvoteComplaint,
  addComment,
  getPublicComplaints,
} from '../controllers/complaintController';
import { getWorkOrders, getWorkOrderById, recalculatePriority } from '../controllers/workOrderController';
import { getCrews } from '../controllers/crewController';
import { getMapWorkOrders } from '../controllers/mapController';
import {
  getDailyPlan,
  generateAndSaveDailyPlan,
  assignWorkOrderManual,
  updateWorkOrderStatus,
} from '../controllers/dailyPlanController';
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

// Apply global Auth Middleware to populate req.user from Bearer token
router.use(firebaseAuthMiddleware);

// Public Endpoints
router.get('/public/complaints', getPublicComplaints);
router.post('/auth/register', registerUser);
router.post('/auth/sync-user', syncUser);

// User Auth Session Endpoints
router.get('/auth/me', getCurrentUser);
router.get('/auth/permissions', requireAuth, getUserPermissions);
router.post('/auth/request-role', requireAuth, requestRoleUpgrade);
router.post('/auth/logout', logoutUser);
router.get('/me/activity', requireAuth, getUserActivity);

// Citizen & General Complaints Endpoints
router.get('/complaints', getComplaints);
router.get('/complaints/:id', getComplaintById);
router.post('/complaints', requireAuth, requireVerifiedEmail, requireActiveAccount, createComplaint);
router.post('/complaints/:id/upvote', requireAuth, requireActiveAccount, upvoteComplaint);
router.post('/complaints/:id/comments', requireAuth, requireActiveAccount, addComment);

// Worker Field Execution Endpoints
router.get('/field/today', requireAuth, requireActiveAccount, requireRole('WORKER', 'AUTHORITY'), getFieldTodayJobs);
router.post('/work-orders/:id/start', requireAuth, requireActiveAccount, requireRole('WORKER', 'AUTHORITY'), startWorkOrder);
router.post('/work-orders/:id/complete', requireAuth, requireActiveAccount, requireRole('WORKER', 'AUTHORITY'), completeWorkOrder);
router.post('/work-orders/:id/evidence', requireAuth, requireActiveAccount, requireRole('WORKER', 'AUTHORITY'), uploadEvidence);

// Authority Command Center & Operational Endpoints
router.get('/dashboard/summary', requireAuth, requireActiveAccount, requireRole('AUTHORITY'), getDashboardSummary);
router.get('/work-orders', requireAuth, requireActiveAccount, requireRole('AUTHORITY', 'WORKER'), getWorkOrders);
router.get('/work-orders/:id', requireAuth, requireActiveAccount, getWorkOrderById);
router.post('/work-orders/:id/calculate-priority', requireAuth, requireActiveAccount, requireRole('AUTHORITY'), recalculatePriority);
router.post('/work-orders/:id/assign', requireAuth, requireActiveAccount, requireRole('AUTHORITY'), assignWorkOrderManual);
router.patch('/work-orders/:id/status', requireAuth, requireActiveAccount, requireRole('AUTHORITY'), updateWorkOrderStatus);

// Daily Plan & Scheduling Endpoints
router.get('/daily-plan', requireAuth, requireActiveAccount, requireRole('AUTHORITY'), getDailyPlan);
router.post('/daily-plan/generate', requireAuth, requireActiveAccount, requireRole('AUTHORITY'), generateAndSaveDailyPlan);
router.get('/daily-plan/route', requireAuth, requireActiveAccount, getDailyPlanRouteHandler);

// Crews, Maps & Routing Endpoints
router.get('/crews', requireAuth, requireActiveAccount, getCrews);
router.get('/map/work-orders', requireAuth, requireActiveAccount, getMapWorkOrders);
router.get('/routes/estimate', requireAuth, requireActiveAccount, getRouteEstimateHandler);

// Operational Analytics & Hotspot Endpoints
router.get('/analytics/operations', requireAuth, requireActiveAccount, requireRole('AUTHORITY'), getOperationalAnalytics);
router.get('/analytics/crews', requireAuth, requireActiveAccount, requireRole('AUTHORITY'), getCrewAnalytics);
router.get('/analytics/wards', requireAuth, requireActiveAccount, requireRole('AUTHORITY'), getWardAnalytics);
router.get('/hotspots', requireAuth, requireActiveAccount, requireRole('AUTHORITY'), getHotspots);
router.post('/hotspots/recalculate', requireAuth, requireActiveAccount, requireRole('AUTHORITY'), recalculateHotspots);
router.get('/hotspots/:id', requireAuth, requireActiveAccount, requireRole('AUTHORITY'), getHotspotById);

// Authority Administration & Audit Endpoints
router.get('/approvals', requireAuth, requireActiveAccount, requireRole('AUTHORITY'), getApprovals);
router.patch('/approvals/:userId', requireAuth, requireActiveAccount, requireRole('AUTHORITY'), updateApprovalStatus);
router.patch('/users/:id/status', requireAuth, requireActiveAccount, requireRole('AUTHORITY'), updateUserStatus);
router.patch('/users/:id/crew', requireAuth, requireActiveAccount, requireRole('AUTHORITY'), updateUserCrew);
router.get('/audit-log', requireAuth, requireActiveAccount, requireRole('AUTHORITY'), getFullAuditLog);

export default router;
