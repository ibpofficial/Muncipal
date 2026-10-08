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

  console.log('🌱 Seeding Jaipur Municipal Wards...');
  const wards = [
    {
      id: 'WARD-12',
      name: 'Ward 12 - Pink City & Heritage Corridor',
      zone: 'Central Heritage Zone',
      population: 158000,
      areaKm2: 14.5,
    },
    {
      id: 'WARD-18',
      name: 'Ward 18 - Vaishali & Chitrakoot Zone',
      zone: 'West Suburban Zone',
      population: 132000,
      areaKm2: 24.8,
    },
    {
      id: 'WARD-24',
      name: 'Ward 24 - Malviya Nagar & Apex Hub',
      zone: 'South Tech & Commercial Zone',
      population: 175000,
      areaKm2: 28.2,
    },
  ];

  for (const ward of wards) {
    await prisma.ward.create({ data: ward });
  }

  console.log('🌱 Seeding Jaipur Repair Crews...');
  const crews = [
    {
      id: 'CREW-01',
      name: 'CREW-01 (Jaipur Rapid Asphalt Alpha)',
      members: 5,
      specialization: 'Asphalt & surface repair',
      currentLatitude: 26.9150,
      currentLongitude: 75.8050,
      availabilityStatus: 'AVAILABLE',
      workingStart: '08:30',
      workingEnd: '17:00',
      dailyCapacity: 4,
      assignedCount: 0,
    },
    {
      id: 'CREW-02',
      name: 'CREW-02 (Jaipur Infra Maintenance Beta)',
      members: 4,
      specialization: 'General road maintenance',
      currentLatitude: 26.8600,
      currentLongitude: 75.8100,
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

  console.log('🌱 Seeding Jaipur Road Assets...');
  const roadAssetsData = [
    // Ward 12 Assets (Pink City)
    { id: 'AST-101', type: 'SCHOOL', name: 'SMS Medical College & Hospital', latitude: 26.9110, longitude: 75.8160, importance: 98, wardId: 'WARD-12' },
    { id: 'AST-102', type: 'BUS_STOP', name: 'Sindhi Camp Central Bus Station', latitude: 26.9240, longitude: 75.7980, importance: 92, wardId: 'WARD-12' },
    { id: 'AST-103', type: 'MARKET', name: 'Bapu Bazar & Johari Market', latitude: 26.9190, longitude: 75.8240, importance: 88, wardId: 'WARD-12' },
    { id: 'AST-104', type: 'INTERSECTION', name: 'Ajmeri Gate Junction (MI Road)', latitude: 26.9150, longitude: 75.8150, importance: 95, wardId: 'WARD-12' },

    // Ward 18 Assets (Vaishali Nagar)
    { id: 'AST-201', type: 'SCHOOL', name: 'DAV Public School (Vaishali)', latitude: 26.9080, longitude: 75.7480, importance: 88, wardId: 'WARD-18' },
    { id: 'AST-202', type: 'MARKET', name: 'Amrapali Circle Shopping Hub', latitude: 26.9020, longitude: 75.7400, importance: 85, wardId: 'WARD-18' },
    { id: 'AST-203', type: 'BUS_STOP', name: 'Chitrakoot Express Bus Terminal', latitude: 26.9000, longitude: 75.7350, importance: 78, wardId: 'WARD-18' },
    { id: 'AST-204', type: 'PUBLIC_AREA', name: 'Nursery Circle Park & Promenade', latitude: 26.9100, longitude: 75.7500, importance: 70, wardId: 'WARD-18' },

    // Ward 24 Assets (Malviya Nagar)
    { id: 'AST-301', type: 'HOSPITAL', name: 'Fortis Escorts Hospital (JLN Marg)', latitude: 26.8520, longitude: 75.8120, importance: 98, wardId: 'WARD-24' },
    { id: 'AST-302', type: 'INTERSECTION', name: 'OTS Circle & Apex Junction', latitude: 26.8650, longitude: 75.8180, importance: 94, wardId: 'WARD-24' },
    { id: 'AST-303', type: 'MARKET', name: 'Gaurav Tower & World Trade Park', latitude: 26.8540, longitude: 75.8050, importance: 90, wardId: 'WARD-24' },
    { id: 'AST-304', type: 'BUS_STOP', name: 'Malviya Nagar Sector 3 Express Stop', latitude: 26.8480, longitude: 75.8100, importance: 76, wardId: 'WARD-24' },
  ];

  for (const asset of roadAssetsData) {
    await prisma.roadAsset.create({ data: asset });
  }

  console.log('🌱 Generating 50 Realistic Jaipur Complaints & Work Orders...');

  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

  const complaintSeeds = [
    // Ward 12 (Pink City & MI Road Corridor - 18 complaints)
    { id: 'CMP-001', ticketNumber: 'TKT-JPR-101', description: 'Open manhole cover missing on MI Road near Ajmeri Gate causing severe traffic hazard', latitude: 26.9152, longitude: 75.8152, wardId: 'WARD-12', roadType: 'Arterial', reportedAt: daysAgo(3), status: 'PENDING', duration: 180 },
    { id: 'CMP-002', ticketNumber: 'TKT-JPR-102', description: 'Deep pothole and asphalt breakdown near Sindhi Camp bus terminal entrance', latitude: 26.9242, longitude: 75.7982, wardId: 'WARD-12', roadType: 'Arterial', reportedAt: daysAgo(5), status: 'PENDING', duration: 120 },
    { id: 'CMP-003', ticketNumber: 'TKT-JPR-103', description: 'Road collapse and sinkhole near Bapu Bazar main heritage entry corridor', latitude: 26.9192, longitude: 75.8242, wardId: 'WARD-12', roadType: 'Collector', reportedAt: daysAgo(2), status: 'PENDING', duration: 180 },
    { id: 'CMP-004', ticketNumber: 'TKT-JPR-104', description: 'Large dangerous pothole blocking inner lane at SMS Hospital trauma gate route', latitude: 26.9112, longitude: 75.8162, wardId: 'WARD-12', roadType: 'Arterial', reportedAt: daysAgo(10), status: 'PENDING', duration: 90 },
    { id: 'CMP-005', ticketNumber: 'TKT-JPR-105', description: 'Pothole and damaged road surface on C-Scheme Bhagwan Das Road link', latitude: 26.9140, longitude: 75.8080, wardId: 'WARD-12', roadType: 'Collector', reportedAt: daysAgo(1), status: 'PENDING', duration: 90 },
    { id: 'CMP-006', ticketNumber: 'TKT-JPR-106', description: 'Broken road surface with loose gravel near Panch Batti circle', latitude: 26.9165, longitude: 75.8125, wardId: 'WARD-12', roadType: 'Collector', reportedAt: daysAgo(16), status: 'PENDING', duration: 60 },
    { id: 'CMP-007', ticketNumber: 'TKT-JPR-107', description: 'Dangerous lane blocked by asphalt depression near Johari Bazar jewellery street', latitude: 26.9210, longitude: 75.8260, wardId: 'WARD-12', roadType: 'Local', reportedAt: daysAgo(4), status: 'PENDING', duration: 90 },
    { id: 'CMP-008', ticketNumber: 'TKT-JPR-108', description: 'Damaged surface and rough pavement on Ashok Marg C-Scheme', latitude: 26.9125, longitude: 75.8025, wardId: 'WARD-12', roadType: 'Local', reportedAt: daysAgo(6), status: 'PENDING', duration: 60 },
    { id: 'CMP-009', ticketNumber: 'TKT-JPR-109', description: 'Road crack and uneven pavement along Kishanpole Bazar lane', latitude: 26.9205, longitude: 75.8180, wardId: 'WARD-12', roadType: 'Residential', reportedAt: daysAgo(8), status: 'PENDING', duration: 45 },
    { id: 'CMP-010', ticketNumber: 'TKT-JPR-110', description: 'Small pothole on residential lane near Civil Lines metro station', latitude: 26.9090, longitude: 75.7890, wardId: 'WARD-12', roadType: 'Residential', reportedAt: daysAgo(1), status: 'PENDING', duration: 45 },
    { id: 'CMP-011', ticketNumber: 'TKT-JPR-111', description: 'Minor surface crack along C-Scheme residential lane 3', latitude: 26.9135, longitude: 75.8045, wardId: 'WARD-12', roadType: 'Residential', reportedAt: daysAgo(0), status: 'PENDING', duration: 30 },
    { id: 'CMP-012', ticketNumber: 'TKT-JPR-112', description: 'Slight pavement wear near Central Park perimeter walk', latitude: 26.9070, longitude: 75.8070, wardId: 'WARD-12', roadType: 'Residential', reportedAt: daysAgo(2), status: 'PENDING', duration: 30 },
    { id: 'CMP-013', ticketNumber: 'TKT-JPR-113', description: 'Large pothole on Collector road near Government Hostel circle', latitude: 26.9180, longitude: 75.8040, wardId: 'WARD-12', roadType: 'Collector', reportedAt: daysAgo(3), status: 'ASSIGNED', duration: 90 },
    { id: 'CMP-014', ticketNumber: 'TKT-JPR-114', description: 'Damaged surface near Statue Circle roundabout', latitude: 26.9095, longitude: 75.8055, wardId: 'WARD-12', roadType: 'Arterial', reportedAt: daysAgo(7), status: 'ASSIGNED', duration: 90 },
    { id: 'CMP-015', ticketNumber: 'TKT-JPR-115', description: 'Broken road pavement near Tripolia Bazar bypass', latitude: 26.9230, longitude: 75.8230, wardId: 'WARD-12', roadType: 'Local', reportedAt: daysAgo(12), status: 'IN_PROGRESS', duration: 60 },
    { id: 'CMP-016', ticketNumber: 'TKT-JPR-116', description: 'Pothole patch repair completed near Government Press circle', latitude: 26.9160, longitude: 75.8010, wardId: 'WARD-12', roadType: 'Local', reportedAt: daysAgo(14), status: 'COMPLETED', duration: 60 },
    { id: 'CMP-017', ticketNumber: 'TKT-JPR-117', description: 'Minor crack filled near Albert Hall Museum front avenue', latitude: 26.9115, longitude: 75.8195, wardId: 'WARD-12', roadType: 'Collector', reportedAt: daysAgo(18), status: 'COMPLETED', duration: 45 },
    { id: 'CMP-018', ticketNumber: 'TKT-JPR-118', description: 'Surface crack sealed on Sardar Patel Marg residential road', latitude: 26.9085, longitude: 75.7985, wardId: 'WARD-12', roadType: 'Residential', reportedAt: daysAgo(20), status: 'COMPLETED', duration: 45 },

    // Ward 18 (Vaishali Nagar & Sirsi Road Belt - 17 complaints)
    { id: 'CMP-019', ticketNumber: 'TKT-JPR-201', description: 'Severe road collapse and open trench near Amrapali Circle main junction', latitude: 26.9022, longitude: 75.7402, wardId: 'WARD-18', roadType: 'Arterial', reportedAt: daysAgo(2), status: 'PENDING', duration: 180 },
    { id: 'CMP-020', ticketNumber: 'TKT-JPR-202', description: 'Deep pothole causing two-wheeler crash hazard on Sirsi Road corridor', latitude: 26.9110, longitude: 75.7350, wardId: 'WARD-18', roadType: 'Arterial', reportedAt: daysAgo(4), status: 'PENDING', duration: 150 },
    { id: 'CMP-021', ticketNumber: 'TKT-JPR-203', description: 'Open manhole missing cover right in front of DAV School Vaishali gate', latitude: 26.9082, longitude: 75.7482, wardId: 'WARD-18', roadType: 'Collector', reportedAt: daysAgo(1), status: 'PENDING', duration: 120 },
    { id: 'CMP-022', ticketNumber: 'TKT-JPR-204', description: 'Large pothole and traffic block near Chitrakoot express bus station', latitude: 26.9002, longitude: 75.7352, wardId: 'WARD-18', roadType: 'Arterial', reportedAt: daysAgo(6), status: 'PENDING', duration: 90 },
    { id: 'CMP-023', ticketNumber: 'TKT-JPR-205', description: 'Dangerous lane blocked by crumbling asphalt near Nursery Circle plaza', latitude: 26.9102, longitude: 75.7502, wardId: 'WARD-18', roadType: 'Arterial', reportedAt: daysAgo(9), status: 'PENDING', duration: 90 },
    { id: 'CMP-024', ticketNumber: 'TKT-JPR-206', description: 'Pothole and broken road near National Handloom Vaishali shopping street', latitude: 26.9040, longitude: 75.7440, wardId: 'WARD-18', roadType: 'Collector', reportedAt: daysAgo(3), status: 'PENDING', duration: 60 },
    { id: 'CMP-025', ticketNumber: 'TKT-JPR-207', description: 'Damaged surface on Vaishali Sector 4 access road', latitude: 26.9060, longitude: 75.7420, wardId: 'WARD-18', roadType: 'Local', reportedAt: daysAgo(11), status: 'PENDING', duration: 60 },
    { id: 'CMP-026', ticketNumber: 'TKT-JPR-208', description: 'Rough road with surface crack near Queens Road intersection', latitude: 26.8980, longitude: 75.7550, wardId: 'WARD-18', roadType: 'Local', reportedAt: daysAgo(15), status: 'PENDING', duration: 45 },
    { id: 'CMP-027', ticketNumber: 'TKT-JPR-209', description: 'Road crack and asphalt erosion on Chitrakoot scheme lane 7', latitude: 26.8970, longitude: 75.7380, wardId: 'WARD-18', roadType: 'Residential', reportedAt: daysAgo(5), status: 'PENDING', duration: 45 },
    { id: 'CMP-028', ticketNumber: 'TKT-JPR-210', description: 'Small pothole on Gandhi Path West residential sector', latitude: 26.8950, longitude: 75.7320, wardId: 'WARD-18', roadType: 'Residential', reportedAt: daysAgo(0), status: 'PENDING', duration: 30 },
    { id: 'CMP-029', ticketNumber: 'TKT-JPR-211', description: 'Minor crack on Hanuman Nagar residential driveway approach', latitude: 26.9120, longitude: 75.7410, wardId: 'WARD-18', roadType: 'Residential', reportedAt: daysAgo(2), status: 'PENDING', duration: 30 },
    { id: 'CMP-030', ticketNumber: 'TKT-JPR-212', description: 'Slight pavement damage near Vaishali Executive Park gate', latitude: 26.9090, longitude: 75.7470, wardId: 'WARD-18', roadType: 'Residential', reportedAt: daysAgo(3), status: 'PENDING', duration: 30 },
    { id: 'CMP-031', ticketNumber: 'TKT-JPR-213', description: 'Large pothole near Amrapali Plaza street 2', latitude: 26.9030, longitude: 75.7410, wardId: 'WARD-18', roadType: 'Arterial', reportedAt: daysAgo(2), status: 'ASSIGNED', duration: 90 },
    { id: 'CMP-032', ticketNumber: 'TKT-JPR-214', description: 'Broken pavement near Nursery Circle park walkway', latitude: 26.9105, longitude: 75.7505, wardId: 'WARD-18', roadType: 'Local', reportedAt: daysAgo(8), status: 'IN_PROGRESS', duration: 60 },
    { id: 'CMP-033', ticketNumber: 'TKT-JPR-215', description: 'Dangerous pothole repaired on Sirsi Road flyover slip road', latitude: 26.9115, longitude: 75.7360, wardId: 'WARD-18', roadType: 'Arterial', reportedAt: daysAgo(12), status: 'COMPLETED', duration: 90 },
    { id: 'CMP-034', ticketNumber: 'TKT-JPR-216', description: 'Pothole filled near Chitrakoot Stadium gate', latitude: 26.8990, longitude: 75.7360, wardId: 'WARD-18', roadType: 'Local', reportedAt: daysAgo(15), status: 'COMPLETED', duration: 45 },
    { id: 'CMP-035', ticketNumber: 'TKT-JPR-217', description: 'Surface crack sealed on Vaishali Block C residential street', latitude: 26.9045, longitude: 75.7455, wardId: 'WARD-18', roadType: 'Residential', reportedAt: daysAgo(22), status: 'COMPLETED', duration: 30 },

    // Ward 24 (Malviya Nagar & JLN Marg Hub - 15 complaints)
    { id: 'CMP-036', ticketNumber: 'TKT-JPR-301', description: 'Open sinkhole and structural failure on JLN Marg near Fortis Hospital gate', latitude: 26.8522, longitude: 75.8122, wardId: 'WARD-24', roadType: 'Arterial', reportedAt: daysAgo(1), status: 'PENDING', duration: 180 },
    { id: 'CMP-037', ticketNumber: 'TKT-JPR-302', description: 'Deep pothole and accident risk at OTS Circle traffic junction', latitude: 26.8652, longitude: 75.8182, wardId: 'WARD-24', roadType: 'Arterial', reportedAt: daysAgo(3), status: 'PENDING', duration: 120 },
    { id: 'CMP-038', ticketNumber: 'TKT-JPR-303', description: 'Open manhole missing cover near Gaurav Tower shopping complex corridor', latitude: 26.8542, longitude: 75.8052, wardId: 'WARD-24', roadType: 'Collector', reportedAt: daysAgo(5), status: 'PENDING', duration: 120 },
    { id: 'CMP-039', ticketNumber: 'TKT-JPR-304', description: 'Large pothole blocking bus route near World Trade Park entrance', latitude: 26.8530, longitude: 75.8040, wardId: 'WARD-24', roadType: 'Collector', reportedAt: daysAgo(7), status: 'PENDING', duration: 90 },
    { id: 'CMP-040', ticketNumber: 'TKT-JPR-305', description: 'Dangerous road breakdown near Apex Hospital Malviya Nagar route', latitude: 26.8610, longitude: 75.8140, wardId: 'WARD-24', roadType: 'Arterial', reportedAt: daysAgo(10), status: 'PENDING', duration: 90 },
    { id: 'CMP-041', ticketNumber: 'TKT-JPR-306', description: 'Damaged road surface near Malviya Nagar Sector 3 bus stop', latitude: 26.8482, longitude: 75.8102, wardId: 'WARD-24', roadType: 'Local', reportedAt: daysAgo(4), status: 'PENDING', duration: 60 },
    { id: 'CMP-042', ticketNumber: 'TKT-JPR-307', description: 'Pothole on local connecting road near Calgiri Marg circle', latitude: 26.8580, longitude: 75.8120, wardId: 'WARD-24', roadType: 'Local', reportedAt: daysAgo(14), status: 'PENDING', duration: 60 },
    { id: 'CMP-043', ticketNumber: 'TKT-JPR-308', description: 'Rough road pavement near Sector 7 residential area', latitude: 26.8450, longitude: 75.8150, wardId: 'WARD-24', roadType: 'Residential', reportedAt: daysAgo(6), status: 'PENDING', duration: 45 },
    { id: 'CMP-044', ticketNumber: 'TKT-JPR-309', description: 'Road crack along Malviya Nagar Sector 1 lane 4', latitude: 26.8500, longitude: 75.8080, wardId: 'WARD-24', roadType: 'Residential', reportedAt: daysAgo(2), status: 'PENDING', duration: 30 },
    { id: 'CMP-045', ticketNumber: 'TKT-JPR-310', description: 'Small pothole near Malviya Nagar house #204', latitude: 26.8420, longitude: 75.8180, wardId: 'WARD-24', roadType: 'Residential', reportedAt: daysAgo(1), status: 'PENDING', duration: 30 },
    { id: 'CMP-046', ticketNumber: 'TKT-JPR-311', description: 'Minor crack on Sangeet Marg residential street', latitude: 26.8400, longitude: 75.8160, wardId: 'WARD-24', roadType: 'Residential', reportedAt: daysAgo(0), status: 'PENDING', duration: 30 },
    { id: 'CMP-047', ticketNumber: 'TKT-JPR-312', description: 'Deep pothole on Tonk Road slip lane near JLN junction', latitude: 26.8640, longitude: 75.8160, wardId: 'WARD-24', roadType: 'Arterial', reportedAt: daysAgo(3), status: 'ASSIGNED', duration: 90 },
    { id: 'CMP-048', ticketNumber: 'TKT-JPR-313', description: 'Pothole near Malviya National Institute of Tech (MNIT) gate', latitude: 26.8620, longitude: 75.8100, wardId: 'WARD-24', roadType: 'Local', reportedAt: daysAgo(5), status: 'IN_PROGRESS', duration: 60 },
    { id: 'CMP-049', ticketNumber: 'TKT-JPR-314', description: 'Repaired road surface near GT Central plaza', latitude: 26.8548, longitude: 75.8058, wardId: 'WARD-24', roadType: 'Collector', reportedAt: daysAgo(16), status: 'COMPLETED', duration: 60 },
    { id: 'CMP-050', ticketNumber: 'TKT-JPR-315', description: 'Surface crack sealed in Malviya Nagar Sector 5', latitude: 26.8470, longitude: 75.8120, wardId: 'WARD-24', roadType: 'Residential', reportedAt: daysAgo(25), status: 'COMPLETED', duration: 30 },
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

  console.log('✅ Jaipur Municipal Database Seeding Complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
