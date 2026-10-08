import { evaluateCrewSuitability, CrewAssignmentInput, WorkOrderAssignmentInput } from './crewAssignmentEngine';

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
  priorityBand: string;
  severity: string;
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
  priorityBand: string;
  description: string;
  roadType: string;
  wardName: string;
  reason: string;
}

export interface DailyPlanResult {
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
}

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function generateDailyPlan(
  workOrders: WorkOrderAssignmentInput[],
  crews: CrewAssignmentInput[],
  planDate: string = new Date().toISOString().split('T')[0]
): DailyPlanResult {
  // Sort work orders by priorityScore DESC
  const sortedWorkOrders = [...workOrders].sort((a, b) => b.priorityScore - a.priorityScore);

  // Initialize crew tracking state
  const crewStates = crews.map((c) => ({
    crew: { ...c },
    currentLat: c.currentLatitude,
    currentLng: c.currentLongitude,
    currentMin: timeToMinutes(c.workingStart || '08:30'),
    assignedCount: 0,
    totalTravelKm: 0,
    totalTravelMin: 0,
    totalWorkMin: 0,
    jobs: [] as ScheduledJobItem[],
  }));

  const remainingQueue: UnscheduledItem[] = [];
  const planReasons: string[] = [];

  let totalPlannedJobs = 0;

  for (const wo of sortedWorkOrders) {
    // Find best eligible crew for this work order
    let bestCrewState: (typeof crewStates)[0] | null = null;
    let bestSuitabilityScore = -1;
    let bestTravelKm = 0;
    let bestTravelMin = 0;
    let bestReason = '';

    for (const state of crewStates) {
      if (state.assignedCount >= state.crew.dailyCapacity) continue;

      const evalRes = evaluateCrewSuitability(wo, state.crew, {
        lat: state.currentLat,
        lng: state.currentLng,
      });

      if (!evalRes.eligible) continue;

      // Check if job fits before 17:00 (working end)
      let arrivalMin = state.currentMin + evalRes.travelTimeMin;

      // Lunch break: 13:00 (780 min) to 13:30 (810 min)
      if (arrivalMin >= 780 && arrivalMin < 810) {
        arrivalMin = 810; // Shift start to after lunch break
      } else if (arrivalMin < 780 && arrivalMin + wo.estimatedDuration > 780) {
        arrivalMin += 30; // Add 30 min lunch break during long job
      }

      const finishMin = arrivalMin + wo.estimatedDuration;
      const endOfDayMin = timeToMinutes(state.crew.workingEnd || '17:00');

      if (finishMin > endOfDayMin) continue; // Exceeds shift hours

      if (evalRes.suitabilityScore > bestSuitabilityScore) {
        bestSuitabilityScore = evalRes.suitabilityScore;
        bestCrewState = state;
        bestTravelKm = evalRes.distanceKm;
        bestTravelMin = evalRes.travelTimeMin;
        bestReason = evalRes.reasons[0] || 'Suitable crew match';
      }
    }

    if (bestCrewState) {
      // Assign job to best crew
      const sequence = bestCrewState.assignedCount + 1;

      let startMin = bestCrewState.currentMin + bestTravelMin;
      // Handle lunch break
      if (startMin >= 780 && startMin < 810) {
        startMin = 810;
      }
      const endMin = startMin + wo.estimatedDuration;

      const jobItem: ScheduledJobItem = {
        workOrderId: wo.id,
        workOrderNumber: wo.workOrderNumber,
        sequence,
        scheduledStart: minutesToTime(startMin),
        scheduledEnd: minutesToTime(endMin),
        estimatedDuration: wo.estimatedDuration,
        travelDistanceKm: bestTravelKm,
        travelTimeMin: bestTravelMin,
        priorityScore: wo.priorityScore,
        priorityBand: (wo as any).priorityBand || 'MEDIUM',
        severity: wo.severity,
        roadType: wo.roadType,
        description: wo.description,
        wardName: (wo as any).wardName || 'Ward',
        latitude: wo.latitude,
        longitude: wo.longitude,
        suitabilityScore: bestSuitabilityScore,
        reason: bestReason,
      };

      bestCrewState.jobs.push(jobItem);
      bestCrewState.assignedCount++;
      bestCrewState.currentLat = wo.latitude;
      bestCrewState.currentLng = wo.longitude;
      bestCrewState.currentMin = endMin;
      bestCrewState.totalTravelKm += bestTravelKm;
      bestCrewState.totalTravelMin += bestTravelMin;
      bestCrewState.totalWorkMin += wo.estimatedDuration;
      totalPlannedJobs++;
    } else {
      // Unscheduled item
      let reason = 'No suitable crew capacity remaining today';
      if (wo.priorityScore < 40) {
        reason = 'Lower priority work order deferred to routine schedule';
      } else if (crews.every((c) => c.assignedCount >= c.dailyCapacity)) {
        reason = 'All active repair crews reached maximum daily job capacity';
      }

      remainingQueue.push({
        workOrderId: wo.id,
        workOrderNumber: wo.workOrderNumber,
        priorityScore: wo.priorityScore,
        priorityBand: (wo as any).priorityBand || 'LOW',
        description: wo.description,
        roadType: wo.roadType,
        wardName: (wo as any).wardName || 'Ward',
        reason,
      });
    }
  }

  // Format final output
  let grandTotalKm = 0;
  let grandTotalWorkMin = 0;
  let grandTotalTravelMin = 0;

  const crewPlans: CrewPlan[] = crewStates.map((cs) => {
    const totalKm = Math.round(cs.totalTravelKm * 10) / 10;
    grandTotalKm += totalKm;
    grandTotalWorkMin += cs.totalWorkMin;
    grandTotalTravelMin += cs.totalTravelMin;

    const capacityUtil = Math.round((cs.assignedCount / cs.crew.dailyCapacity) * 100);

    const totalMin = cs.totalWorkMin + cs.totalTravelMin;
    const hours = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    const formattedFieldTime = `${hours}h ${mins}m`;

    return {
      crewId: cs.crew.id,
      crewName: cs.crew.name,
      specialization: cs.crew.specialization,
      availabilityStatus: cs.crew.availabilityStatus,
      currentLatitude: cs.crew.currentLatitude,
      currentLongitude: cs.crew.currentLongitude,
      dailyCapacity: cs.crew.dailyCapacity,
      assignedCount: cs.assignedCount,
      capacityUtilizationPercent: capacityUtil,
      totalTravelDistanceKm: totalKm,
      totalTravelTimeMin: cs.totalTravelMin,
      totalWorkTimeMin: cs.totalWorkMin,
      totalFieldTimeFormatted: formattedFieldTime,
      jobs: cs.jobs,
    };
  });

  const totalCapacityAvailable = crews.reduce((acc, c) => acc + c.dailyCapacity, 0);
  const totalCapacityUtil = Math.round((totalPlannedJobs / totalCapacityAvailable) * 100);

  const grandTotalMin = grandTotalWorkMin + grandTotalTravelMin;
  const grandHours = Math.floor(grandTotalMin / 60);
  const grandMins = grandTotalMin % 60;
  const grandFieldTime = `${grandHours}h ${grandMins}m`;

  const criticalCount = sortedWorkOrders.filter((w) => w.priorityScore >= 80).length;
  planReasons.push(`${criticalCount} Critical priority work orders evaluated first`);
  planReasons.push(`Crew routes optimized using geographic proximity from initial dispatch hubs`);
  planReasons.push(`Work schedules structured between 08:30 and 17:00 with 30-min lunch break`);
  if (remainingQueue.length > 0) {
    planReasons.push(`${remainingQueue.length} work orders remain in queue due to crew capacity limits`);
  }

  return {
    date: planDate,
    summary: {
      totalJobsPlanned: totalPlannedJobs,
      crewsUsed: crewPlans.filter((cp) => cp.jobs.length > 0).length,
      totalTravelKm: Math.round(grandTotalKm * 10) / 10,
      totalFieldTimeFormatted: grandFieldTime,
      capacityUtilizationPercent: totalCapacityUtil,
      unscheduledCount: remainingQueue.length,
    },
    crewPlans,
    remainingQueue,
    planReasons,
  };
}
