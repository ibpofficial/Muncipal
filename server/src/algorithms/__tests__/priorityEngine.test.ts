import { describe, it, expect } from 'vitest';
import { calculatePriorityDecision } from '../priorityEngine';
import { RoadAssetData } from '../exposureEngine';
import { CrewData } from '../proximityEngine';

const mockAssets: RoadAssetData[] = [
  { id: 'AST-1', name: 'St. Mary School', type: 'SCHOOL', latitude: 12.9716, longitude: 77.5946, importance: 90 },
  { id: 'AST-2', name: 'City Central Hospital', type: 'HOSPITAL', latitude: 12.9800, longitude: 77.6000, importance: 95 },
  { id: 'AST-3', name: 'Metro Bus Stop', type: 'BUS_STOP', latitude: 12.9750, longitude: 77.5900, importance: 75 },
];

const mockCrews: CrewData[] = [
  { id: 'CREW-01', name: 'CREW-01', currentLatitude: 12.9710, currentLongitude: 77.5940, availability: 'AVAILABLE', assignedCount: 1, dailyCapacity: 4, members: 4, specialization: 'Asphalt' },
  { id: 'CREW-02', name: 'CREW-02', currentLatitude: 12.9900, currentLongitude: 77.6100, availability: 'AVAILABLE', assignedCount: 2, dailyCapacity: 4, members: 3, specialization: 'Maintenance' },
];

describe('Priority Engine Algorithm Tests', () => {
  it('TEST 1: Severe pothole + school nearby + arterial road => HIGH/CRITICAL priority', () => {
    const decision = calculatePriorityDecision(
      {
        id: 'TEST-1',
        description: 'Large deep pothole on main road causing severe accident hazard near school entrance',
        latitude: 12.9717,
        longitude: 77.5947,
        roadType: 'Arterial',
        reportedAt: new Date(),
      },
      mockAssets,
      mockCrews
    );

    expect(decision.priorityScore).toBeGreaterThanOrEqual(70);
    expect(['HIGH', 'CRITICAL']).toContain(decision.priorityBand);
    expect(decision.factors.traffic).toBe(90);
    expect(decision.factors.severity).toBeGreaterThanOrEqual(65);
  });

  it('TEST 2: Small pothole + residential road + no nearby assets => LOW priority', () => {
    const decision = calculatePriorityDecision(
      {
        id: 'TEST-2',
        description: 'Small minor crack on quiet street',
        latitude: 13.1000,
        longitude: 77.8000,
        roadType: 'Residential',
        reportedAt: new Date(),
      },
      mockAssets,
      mockCrews
    );

    expect(decision.priorityScore).toBeLessThan(40);
    expect(decision.priorityBand).toBe('LOW');
    expect(decision.factors.traffic).toBe(30);
  });

  it('TEST 3: Medium complaint + 15+ days old => Age significantly increases priority score', () => {
    const freshDate = new Date();
    const oldDate = new Date(Date.now() - 16 * 24 * 60 * 60 * 1000);

    const freshDecision = calculatePriorityDecision(
      {
        id: 'TEST-3A',
        description: 'Damaged surface with rough pavement',
        latitude: 12.9750,
        longitude: 77.5900,
        roadType: 'Local',
        reportedAt: freshDate,
      },
      mockAssets,
      mockCrews
    );

    const oldDecision = calculatePriorityDecision(
      {
        id: 'TEST-3B',
        description: 'Damaged surface with rough pavement',
        latitude: 12.9750,
        longitude: 77.5900,
        roadType: 'Local',
        reportedAt: oldDate,
      },
      mockAssets,
      mockCrews
    );

    expect(oldDecision.factors.age).toBe(100);
    expect(freshDecision.factors.age).toBe(20);
    expect(oldDecision.priorityScore).toBeGreaterThan(freshDecision.priorityScore);
  });

  it('TEST 4: High severity + hospital nearby => HIGH/CRITICAL priority', () => {
    const decision = calculatePriorityDecision(
      {
        id: 'TEST-4',
        description: 'Open manhole cover missing on emergency response corridor',
        latitude: 12.9801,
        longitude: 77.6001,
        roadType: 'Collector',
        reportedAt: new Date(),
      },
      mockAssets,
      mockCrews
    );

    expect(decision.priorityScore).toBeGreaterThanOrEqual(70);
    expect(['HIGH', 'CRITICAL']).toContain(decision.priorityBand);
    expect(decision.factors.exposure).toBeGreaterThan(50);
  });

  it('TEST 5: No available crew => Crew proximity score equals 0', () => {
    const busyCrews: CrewData[] = [
      { id: 'C-1', name: 'C-1', currentLatitude: 12.97, currentLongitude: 77.59, availability: 'BUSY', assignedCount: 4, dailyCapacity: 4, members: 3, specialization: 'General' }
    ];

    const decision = calculatePriorityDecision(
      {
        id: 'TEST-5',
        description: 'Large pothole on road',
        latitude: 12.97,
        longitude: 77.59,
        roadType: 'Local',
        reportedAt: new Date(),
      },
      mockAssets,
      busyCrews
    );

    expect(decision.factors.crewProximity).toBe(0);
    expect(decision.reasons.some(r => r.includes('No available repair crew'))).toBe(true);
  });
});
