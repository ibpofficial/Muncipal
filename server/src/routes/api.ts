import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboardController';
import { getComplaints, getComplaintById, createComplaint } from '../controllers/complaintController';
import { getWorkOrders, getWorkOrderById, recalculatePriority } from '../controllers/workOrderController';
import { getCrews } from '../controllers/crewController';
import { getMapWorkOrders } from '../controllers/mapController';
import {
  getDailyPlan,
  generateAndSaveDailyPlan,
  assignWorkOrderManual,
  updateWorkOrderStatus,
} from '../controllers/dailyPlanController';

const router = Router();

// Dashboard summary
router.get('/dashboard/summary', getDashboardSummary);

// Complaints REST endpoints
router.get('/complaints', getComplaints);
router.get('/complaints/:id', getComplaintById);
router.post('/complaints', createComplaint);

// Work Orders REST endpoints
router.get('/work-orders', getWorkOrders);
router.get('/work-orders/:id', getWorkOrderById);
router.post('/work-orders/:id/calculate-priority', recalculatePriority);
router.post('/work-orders/:id/assign', assignWorkOrderManual);
router.patch('/work-orders/:id/status', updateWorkOrderStatus);

// Daily Plan REST endpoints
router.get('/daily-plan', getDailyPlan);
router.post('/daily-plan/generate', generateAndSaveDailyPlan);

// Crews REST endpoints
router.get('/crews', getCrews);

// Map REST endpoints
router.get('/map/work-orders', getMapWorkOrders);

export default router;
