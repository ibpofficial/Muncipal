import { PrismaClient } from '@prisma/client';
import { calculatePriorityDecision } from '../server/src/algorithms/priorityEngine';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning existing database...');
  await prisma.assignmentOverride.deleteMany({});
  await prisma.assignmentDecision.deleteMany({});
  await prisma.planItem.deleteMany({});
  await prisma.dailyPlan.deleteMany({});
  await prisma.workOrder.deleteMany({});
  await prisma.complaint.deleteMany({});
  await prisma.roadAsset.deleteMany({});
  await prisma.crew.deleteMany({});
  await prisma.ward.deleteMany({});

  console.log('🌱 Seeding Wards...');
  const wards = [
    {
      id: 'WARD-12',
      name: 'Ward 12 - Civic & Educational Hub',
      zone: 'North Zone',
      population: 142000,
      areaKm2: 18.5,
    },
    {
      id: 'WARD-18',
      name: 'Ward 18 - Medical & Commercial Belt',
      zone: 'East Zone',
      population: 118000,
      areaKm2: 22.1,
    },
    {
      id: 'WARD-24',
      name: 'Ward 24 - Metro Residential Sector',
      zone: 'South Zone',
      population: 165000,
      areaKm2: 31.0,
    },
  ];

  for (const ward of wards) {
    await prisma.ward.create({ data: ward });
  }

  console.log('🌱 Seeding Crews...');
  const crews = [
    {
      id: 'CREW-01',
      name: 'CREW-01 (Rapid Asphalt Alpha)',
      members: 5,
      specialization: 'Asphalt & surface repair',
      currentLatitude: 12.9725,
      currentLongitude: 77.5930,
      availabilityStatus: 'AVAILABLE',
      workingStart: '08:30',
      workingEnd: '17:00',
      dailyCapacity: 4,
      assignedCount: 0,
    },
    {
      id: 'CREW-02',
      name: 'CREW-02 (Infrastructure Beta)',
      members: 4,
      specialization: 'General road maintenance',
      currentLatitude: 12.9850,
      currentLongitude: 77.6120,
      availabilityStatus: 'AVAILABLE',
      workingStart: '08:30',
      workingEnd: '17:00',
      dailyCapacity: 4,
      assignedCount: 0,
    },
  ];

  for (const crew of crews) {
    await prisma.crew.create({ data: crew });
  }

  console.log('🌱 Seeding Road Assets...');
  const roadAssetsData = [
    // Ward 12 Assets
    { id: 'AST-101', type: 'SCHOOL', name: 'St. Xavier Public School', latitude: 12.9730, longitude: 77.5940, importance: 92, wardId: 'WARD-12' },
    { id: 'AST-102', type: 'BUS_STOP', name: 'Town Hall Bus Terminal', latitude: 12.9745, longitude: 77.5960, importance: 80, wardId: 'WARD-12' },
    { id: 'AST-103', type: 'MARKET', name: 'Central Municipal Market', latitude: 12.9710, longitude: 77.5910, importance: 85, wardId: 'WARD-12' },
    { id: 'AST-104', type: 'INTERSECTION', name: 'MG Road Traffic Junction', latitude: 12.9755, longitude: 77.5980, importance: 90, wardId: 'WARD-12' },

    // Ward 18 Assets
    { id: 'AST-201', type: 'HOSPITAL', name: 'Victoria Apex Government Hospital', latitude: 12.9860, longitude: 77.6140, importance: 98, wardId: 'WARD-18' },
    { id: 'AST-202', type: 'SCHOOL', name: 'National Public College', latitude: 12.9820, longitude: 77.6080, importance: 88, wardId: 'WARD-18' },
    { id: 'AST-203', type: 'BUS_STOP', name: 'Medical College Express Stop', latitude: 12.9870, longitude: 77.6150, importance: 78, wardId: 'WARD-18' },
    { id: 'AST-204', type: 'PUBLIC_AREA', name: 'Freedom City Park & Promenade', latitude: 12.9800, longitude: 77.6050, importance: 65, wardId: 'WARD-18' },

    // Ward 24 Assets
    { id: 'AST-301', type: 'INTERSECTION', name: 'Ring Road Expressway Circle', latitude: 12.9550, longitude: 77.5800, importance: 95, wardId: 'WARD-24' },
    { id: 'AST-302', type: 'SCHOOL', name: 'Greenwood High Academy', latitude: 12.9580, longitude: 77.5840, importance: 90, wardId: 'WARD-24' },
    { id: 'AST-303', type: 'MARKET', name: 'Sector 4 Community Plaza', latitude: 12.9520, longitude: 77.5750, importance: 70, wardId: 'WARD-24' },
    { id: 'AST-304', type: 'BUS_STOP', name: 'Suburban Line Central Terminal', latitude: 12.9560, longitude: 77.5810, importance: 75, wardId: 'WARD-24' },
  ];

  for (const asset of roadAssetsData) {
    await prisma.roadAsset.create({ data: asset });
  }

  console.log('🌱 Generating 50 Realistic Complaints & Work Orders...');

  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

  const complaintSeeds = [
    // Ward 12 (18 complaints)
    { id: 'CMP-001', ticketNumber: 'TKT-12-001', description: 'Open manhole cover missing on main road causing severe accident hazard right near school entrance', latitude: 12.9732, longitude: 77.5942, wardId: 'WARD-12', roadType: 'Arterial', reportedAt: daysAgo(3), status: 'PENDING', duration: 180 },
    { id: 'CMP-002', ticketNumber: 'TKT-12-002', description: 'Deep pothole and asphalt breakdown causing two-wheeler crash risk near Town Hall bus terminal', latitude: 12.9747, longitude: 77.5962, wardId: 'WARD-12', roadType: 'Arterial', reportedAt: daysAgo(5), status: 'PENDING', duration: 120 },
    { id: 'CMP-003', ticketNumber: 'TKT-12-003', description: 'Road collapse and sinkhole developing right in front of Central Municipal Market entrance', latitude: 12.9712, longitude: 77.5912, wardId: 'WARD-12', roadType: 'Collector', reportedAt: daysAgo(2), status: 'PENDING', duration: 180 },
    { id: 'CMP-004', ticketNumber: 'TKT-12-004', description: 'Large dangerous pothole blocking inner lane at MG Road traffic junction', latitude: 12.9757, longitude: 77.5982, wardId: 'WARD-12', roadType: 'Arterial', reportedAt: daysAgo(10), status: 'PENDING', duration: 90 },
    { id: 'CMP-005', ticketNumber: 'TKT-12-005', description: 'Pothole and damaged surface on St. Xavier school approach road', latitude: 12.9735, longitude: 77.5945, wardId: 'WARD-12', roadType: 'Collector', reportedAt: daysAgo(1), status: 'PENDING', duration: 90 },
    { id: 'CMP-006', ticketNumber: 'TKT-12-006', description: 'Broken road surface with loose gravel near bus stop', latitude: 12.9742, longitude: 77.5958, wardId: 'WARD-12', roadType: 'Collector', reportedAt: daysAgo(16), status: 'PENDING', duration: 60 },
    { id: 'CMP-007', ticketNumber: 'TKT-12-007', description: 'Dangerous lane blocked by asphalt depression near market street', latitude: 12.9715, longitude: 77.5918, wardId: 'WARD-12', roadType: 'Local', reportedAt: daysAgo(4), status: 'PENDING', duration: 90 },
    { id: 'CMP-008', ticketNumber: 'TKT-12-008', description: 'Damaged surface and rough road surface', latitude: 12.9720, longitude: 77.5925, wardId: 'WARD-12', roadType: 'Local', reportedAt: daysAgo(6), status: 'PENDING', duration: 60 },
    { id: 'CMP-009', ticketNumber: 'TKT-12-009', description: 'Road crack and uneven pavement along 4th Cross street', latitude: 12.9705, longitude: 77.5900, wardId: 'WARD-12', roadType: 'Residential', reportedAt: daysAgo(8), status: 'PENDING', duration: 45 },
    { id: 'CMP-010', ticketNumber: 'TKT-12-010', description: 'Small pothole on quiet residential lane near house #42', latitude: 12.9690, longitude: 77.5880, wardId: 'WARD-12', roadType: 'Residential', reportedAt: daysAgo(1), status: 'PENDING', duration: 45 },
    { id: 'CMP-011', ticketNumber: 'TKT-12-011', description: 'Minor surface crack along residential sidewalk curb', latitude: 12.9685, longitude: 77.5875, wardId: 'WARD-12', roadType: 'Residential', reportedAt: daysAgo(0), status: 'PENDING', duration: 30 },
    { id: 'CMP-012', ticketNumber: 'TKT-12-012', description: 'Slight pavement wear near park perimeter', latitude: 12.9680, longitude: 77.5870, wardId: 'WARD-12', roadType: 'Residential', reportedAt: daysAgo(2), status: 'PENDING', duration: 30 },
    { id: 'CMP-013', ticketNumber: 'TKT-12-013', description: 'Large pothole on Collector road near school zone', latitude: 12.9728, longitude: 77.5938, wardId: 'WARD-12', roadType: 'Collector', reportedAt: daysAgo(3), status: 'ASSIGNED', duration: 90 },
    { id: 'CMP-014', ticketNumber: 'TKT-12-014', description: 'Damaged surface near MG road intersection', latitude: 12.9752, longitude: 77.5978, wardId: 'WARD-12', roadType: 'Arterial', reportedAt: daysAgo(7), status: 'ASSIGNED', duration: 90 },
    { id: 'CMP-015', ticketNumber: 'TKT-12-015', description: 'Broken road pavement near market bypass', latitude: 12.9708, longitude: 77.5908, wardId: 'WARD-12', roadType: 'Local', reportedAt: daysAgo(12), status: 'IN_PROGRESS', duration: 60 },
    { id: 'CMP-016', ticketNumber: 'TKT-12-016', description: 'Pothole patch repair requested', latitude: 12.9718, longitude: 77.5922, wardId: 'WARD-12', roadType: 'Local', reportedAt: daysAgo(14), status: 'COMPLETED', duration: 60 },
    { id: 'CMP-017', ticketNumber: 'TKT-12-017', description: 'Minor crack filled near town hall', latitude: 12.9740, longitude: 77.5955, wardId: 'WARD-12', roadType: 'Collector', reportedAt: daysAgo(18), status: 'COMPLETED', duration: 45 },
    { id: 'CMP-018', ticketNumber: 'TKT-12-018', description: 'Surface crack near 5th main', latitude: 12.9695, longitude: 77.5890, wardId: 'WARD-12', roadType: 'Residential', reportedAt: daysAgo(20), status: 'COMPLETED', duration: 45 },

    // Ward 18 (17 complaints)
    { id: 'CMP-019', ticketNumber: 'TKT-18-001', description: 'Severe road collapse and open trench right outside Victoria Apex Hospital emergency gate', latitude: 12.9862, longitude: 77.6142, wardId: 'WARD-18', roadType: 'Arterial', reportedAt: daysAgo(2), status: 'PENDING', duration: 180 },
    { id: 'CMP-020', ticketNumber: 'TKT-18-002', description: 'Deep pothole causing ambulance delay and severe accident hazard on hospital corridor', latitude: 12.9868, longitude: 77.6148, wardId: 'WARD-18', roadType: 'Arterial', reportedAt: daysAgo(4), status: 'PENDING', duration: 150 },
    { id: 'CMP-021', ticketNumber: 'TKT-18-003', description: 'Open manhole missing cover near National Public College gate', latitude: 12.9822, longitude: 77.6082, wardId: 'WARD-18', roadType: 'Collector', reportedAt: daysAgo(1), status: 'PENDING', duration: 120 },
    { id: 'CMP-022', ticketNumber: 'TKT-18-004', description: 'Large pothole and two-wheeler danger near Medical College express bus stop', latitude: 12.9872, longitude: 77.6152, wardId: 'WARD-18', roadType: 'Arterial', reportedAt: daysAgo(6), status: 'PENDING', duration: 90 },
    { id: 'CMP-023', ticketNumber: 'TKT-18-005', description: 'Dangerous lane blocked by crumbling asphalt near hospital road', latitude: 12.9855, longitude: 77.6135, wardId: 'WARD-18', roadType: 'Arterial', reportedAt: daysAgo(9), status: 'PENDING', duration: 90 },
    { id: 'CMP-024', ticketNumber: 'TKT-18-006', description: 'Pothole and broken road near Freedom City Park entrance', latitude: 12.9802, longitude: 77.6052, wardId: 'WARD-18', roadType: 'Collector', reportedAt: daysAgo(3), status: 'PENDING', duration: 60 },
    { id: 'CMP-025', ticketNumber: 'TKT-18-007', description: 'Damaged surface on college access road', latitude: 12.9825, longitude: 77.6085, wardId: 'WARD-18', roadType: 'Local', reportedAt: daysAgo(11), status: 'PENDING', duration: 60 },
    { id: 'CMP-026', ticketNumber: 'TKT-18-008', description: 'Rough road with surface crack near commercial complex', latitude: 12.9840, longitude: 77.6100, wardId: 'WARD-18', roadType: 'Local', reportedAt: daysAgo(15), status: 'PENDING', duration: 45 },
    { id: 'CMP-027', ticketNumber: 'TKT-18-009', description: 'Road crack and asphalt erosion on 8th main', latitude: 12.9810, longitude: 77.6030, wardId: 'WARD-18', roadType: 'Residential', reportedAt: daysAgo(5), status: 'PENDING', duration: 45 },
    { id: 'CMP-028', ticketNumber: 'TKT-18-010', description: 'Small pothole on residential street 12', latitude: 12.9790, longitude: 77.6010, wardId: 'WARD-18', roadType: 'Residential', reportedAt: daysAgo(0), status: 'PENDING', duration: 30 },
    { id: 'CMP-029', ticketNumber: 'TKT-18-011', description: 'Minor crack on residential driveway approach', latitude: 12.9785, longitude: 77.6005, wardId: 'WARD-18', roadType: 'Residential', reportedAt: daysAgo(2), status: 'PENDING', duration: 30 },
    { id: 'CMP-030', ticketNumber: 'TKT-18-012', description: 'Slight pavement damage near apartment gate', latitude: 12.9780, longitude: 77.6000, wardId: 'WARD-18', roadType: 'Residential', reportedAt: daysAgo(3), status: 'PENDING', duration: 30 },
    { id: 'CMP-031', ticketNumber: 'TKT-18-013', description: 'Large pothole near hospital lane 2', latitude: 12.9865, longitude: 77.6145, wardId: 'WARD-18', roadType: 'Arterial', reportedAt: daysAgo(2), status: 'ASSIGNED', duration: 90 },
    { id: 'CMP-032', ticketNumber: 'TKT-18-014', description: 'Broken pavement near park walkway', latitude: 12.9805, longitude: 77.6055, wardId: 'WARD-18', roadType: 'Local', reportedAt: daysAgo(8), status: 'IN_PROGRESS', duration: 60 },
    { id: 'CMP-033', ticketNumber: 'TKT-18-015', description: 'Dangerous pothole repaired on hospital road', latitude: 12.9858, longitude: 77.6138, wardId: 'WARD-18', roadType: 'Arterial', reportedAt: daysAgo(12), status: 'COMPLETED', duration: 90 },
    { id: 'CMP-034', ticketNumber: 'TKT-18-016', description: 'Pothole filled near college hostel', latitude: 12.9828, longitude: 77.6088, wardId: 'WARD-18', roadType: 'Local', reportedAt: daysAgo(15), status: 'COMPLETED', duration: 45 },
    { id: 'CMP-035', ticketNumber: 'TKT-18-017', description: 'Surface crack sealed on residential road', latitude: 12.9795, longitude: 77.6020, wardId: 'WARD-18', roadType: 'Residential', reportedAt: daysAgo(22), status: 'COMPLETED', duration: 30 },

    // Ward 24 (15 complaints)
    { id: 'CMP-036', ticketNumber: 'TKT-24-001', description: 'Open sinkhole and structural failure on Ring Road expressway circle causing major crash risk', latitude: 12.9552, longitude: 77.5802, wardId: 'WARD-24', roadType: 'Arterial', reportedAt: daysAgo(1), status: 'PENDING', duration: 180 },
    { id: 'CMP-037', ticketNumber: 'TKT-24-002', description: 'Deep pothole and two-wheeler hazard near Greenwood High Academy main entrance', latitude: 12.9582, longitude: 77.5842, wardId: 'WARD-24', roadType: 'Arterial', reportedAt: daysAgo(3), status: 'PENDING', duration: 120 },
    { id: 'CMP-038', ticketNumber: 'TKT-24-003', description: 'Open manhole missing cover near Suburban Line Central bus terminal', latitude: 12.9562, longitude: 77.5812, wardId: 'WARD-24', roadType: 'Collector', reportedAt: daysAgo(5), status: 'PENDING', duration: 120 },
    { id: 'CMP-039', ticketNumber: 'TKT-24-004', description: 'Large pothole blocking bus route near Sector 4 Community Plaza', latitude: 12.9522, longitude: 77.5752, wardId: 'WARD-24', roadType: 'Collector', reportedAt: daysAgo(7), status: 'PENDING', duration: 90 },
    { id: 'CMP-040', ticketNumber: 'TKT-24-005', description: 'Dangerous road breakdown near Ring Road circle flyover slip road', latitude: 12.9555, longitude: 77.5805, wardId: 'WARD-24', roadType: 'Arterial', reportedAt: daysAgo(10), status: 'PENDING', duration: 90 },
    { id: 'CMP-041', ticketNumber: 'TKT-24-006', description: 'Damaged road surface near school bus zone', latitude: 12.9585, longitude: 77.5845, wardId: 'WARD-24', roadType: 'Local', reportedAt: daysAgo(4), status: 'PENDING', duration: 60 },
    { id: 'CMP-042', ticketNumber: 'TKT-24-007', description: 'Pothole on local connecting road near plaza', latitude: 12.9525, longitude: 77.5755, wardId: 'WARD-24', roadType: 'Local', reportedAt: daysAgo(14), status: 'PENDING', duration: 60 },
    { id: 'CMP-043', ticketNumber: 'TKT-24-008', description: 'Rough road pavement near residential sector 3', latitude: 12.9500, longitude: 77.5720, wardId: 'WARD-24', roadType: 'Residential', reportedAt: daysAgo(6), status: 'PENDING', duration: 45 },
    { id: 'CMP-044', ticketNumber: 'TKT-24-009', description: 'Road crack along suburban residential lane 4', latitude: 12.9490, longitude: 77.5700, wardId: 'WARD-24', roadType: 'Residential', reportedAt: daysAgo(2), status: 'PENDING', duration: 30 },
    { id: 'CMP-045', ticketNumber: 'TKT-24-010', description: 'Small pothole near residential house #102', latitude: 12.9480, longitude: 77.5680, wardId: 'WARD-24', roadType: 'Residential', reportedAt: daysAgo(1), status: 'PENDING', duration: 30 },
    { id: 'CMP-046', ticketNumber: 'TKT-24-011', description: 'Minor crack on residential street', latitude: 12.9475, longitude: 77.5675, wardId: 'WARD-24', roadType: 'Residential', reportedAt: daysAgo(0), status: 'PENDING', duration: 30 },
    { id: 'CMP-047', ticketNumber: 'TKT-24-012', description: 'Deep pothole on Ring Road slip lane', latitude: 12.9548, longitude: 77.5798, wardId: 'WARD-24', roadType: 'Arterial', reportedAt: daysAgo(3), status: 'ASSIGNED', duration: 90 },
    { id: 'CMP-048', ticketNumber: 'TKT-24-013', description: 'Pothole near school gate', latitude: 12.9578, longitude: 77.5838, wardId: 'WARD-24', roadType: 'Local', reportedAt: daysAgo(5), status: 'IN_PROGRESS', duration: 60 },
    { id: 'CMP-049', ticketNumber: 'TKT-24-014', description: 'Repaired road surface near bus stop', latitude: 12.9565, longitude: 77.5815, wardId: 'WARD-24', roadType: 'Collector', reportedAt: daysAgo(16), status: 'COMPLETED', duration: 60 },
    { id: 'CMP-050', ticketNumber: 'TKT-24-015', description: 'Surface crack sealed in sector 4', latitude: 12.9510, longitude: 77.5730, wardId: 'WARD-24', roadType: 'Residential', reportedAt: daysAgo(25), status: 'COMPLETED', duration: 30 },
  ];

  for (let index = 0; index < complaintSeeds.length; index++) {
    const compData = complaintSeeds[index];

    const complaint = await prisma.complaint.create({
      data: {
        id: compData.id,
        ticketNumber: compData.ticketNumber,
        description: compData.description,
        latitude: compData.latitude,
        longitude: compData.longitude,
        wardId: compData.wardId,
        roadType: compData.roadType,
        reportedAt: compData.reportedAt,
        status: compData.status,
      },
    });

    const decision = calculatePriorityDecision(
      {
        id: complaint.id,
        description: complaint.description,
        latitude: complaint.latitude,
        longitude: complaint.longitude,
        roadType: complaint.roadType,
        reportedAt: complaint.reportedAt,
      },
      roadAssetsData,
      crews
    );

    const workOrderNumber = `WO-${String(index + 1).padStart(3, '0')}`;
    const assignedCrewId = complaint.status === 'ASSIGNED' || complaint.status === 'IN_PROGRESS' || complaint.status === 'COMPLETED'
      ? (index % 2 === 0 ? 'CREW-01' : 'CREW-02')
      : null;

    await prisma.workOrder.create({
      data: {
        id: `WO-ID-${index + 1}`,
        workOrderNumber,
        complaintId: complaint.id,
        severity: decision.severity,
        severityScore: decision.factors.severity,
        exposureScore: decision.factors.exposure,
        trafficScore: decision.factors.traffic,
        ageScore: decision.factors.age,
        crewProximityScore: decision.factors.crewProximity,
        priorityScore: decision.priorityScore,
        priorityBand: decision.priorityBand,
        assignedCrewId,
        scheduledDate: assignedCrewId ? new Date(Date.now() + 86400000) : null,
        status: complaint.status,
        reasons: JSON.stringify(decision.reasons),
        recommendation: decision.recommendation,
        estimatedDuration: compData.duration,
      },
    });
  }

  console.log('✅ Database Seeding Complete for Phase 2!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
