# MUNICIPAL ROAD-REPAIR WORK-ORDER PRIORITIZER
> *"Turning road complaints into explainable repair decisions."*

---

## 1. Project Overview
The **Municipal Road-Repair Work-Order Prioritizer** is a decision-support platform designed for city operations officers. Municipal authorities face hundreds of citizen road complaints daily but operate with limited repair crews. The challenge is not finding complaints, but deciding **which road problems to repair first, and why**.

This application transforms raw citizen complaint logs into structured work orders, analyzes damage severity, geographic public exposure, road traffic importance, complaint backlog age, and repair crew proximity to compute a transparent **Priority Score (0–100)** with human-readable explanations.

---

## 2. The Problem
Municipalities face:
- **High volume of complaints**: Hundreds of road issues reported across multiple wards.
- **Resource constraints**: Limited active repair crews (e.g., 2 crews to service 50+ complaints).
- **Subjective / Arbitrary scheduling**: Complaints repaired on a "first-come, first-served" or noisy complaint basis rather than objective risk and public exposure.
- **Black-box decisions**: Lack of transparent explanations for why a repair was scheduled or delayed.

---

## 3. The Solution
Our decision-support system provides:
1. **Rule-Based Severity Engine**: Analyzes complaint descriptions for structural damage, hazard signals, and safety risks.
2. **Geographic Public Exposure Engine**: Uses the Haversine formula to measure proximity to critical public infrastructure (schools, hospitals, bus terminals, markets).
3. **Traffic Importance Proxy**: Weights arterial, collector, local, and residential road corridors.
4. **Backlog Urgency**: Escalates priorities for unresolved, long-pending complaints.
5. **Crew Proximity Factor**: Incorporates distance to available municipal repair crews.
6. **Explainable Decision Engine**: Displays clear "WHY" reasons and factor breakdowns for every work order.
7. **Geographic Command Map**: Interactive Leaflet visual command center.

---

## 4. Architecture

```
[ Citizen / Officer ]
        ↓
  React 18 + Vite (Frontend Command Center)
        ↓  REST API (HTTP)
 Express + TypeScript API Server
        ↓
 Priority Engine & Sub-Algorithms
 (Severity, Exposure, Traffic, Age, Proximity)
        ↓
 Prisma ORM
        ↓
 Database (SQLite / PostgreSQL)
```

---

## 5. Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Leaflet & React Leaflet, Recharts.
- **Backend**: Node.js, Express, TypeScript, Vitest.
- **Database & ORM**: Prisma ORM, SQLite / PostgreSQL.

---

## 6. Database Schema
- `Ward`: id, name, zone, population, areaKm2 (3 demo wards: Ward 12, Ward 18, Ward 24).
- `Complaint`: id, ticketNumber, description, photoUrl, latitude, longitude, wardId, roadType, reportedAt, status.
- `WorkOrder`: id, workOrderNumber, complaintId, severity, severityScore, exposureScore, trafficScore, ageScore, crewProximityScore, priorityScore, priorityBand, assignedCrewId, scheduledDate, status, reasons, recommendation.
- `Crew`: id, name, members, specialization, currentLatitude, currentLongitude, availability, dailyCapacity, assignedCount (2 demo crews: CREW-01, CREW-02).
- `RoadAsset`: id, type (SCHOOL, HOSPITAL, BUS_STOP, MARKET, INTERSECTION, PUBLIC_AREA), name, latitude, longitude, importance, wardId.

---

## 7. Priority Scoring Algorithm

The priority score is calculated using a deterministic 5-factor weighted model:

$$\text{Priority Score } (P) = 0.40S + 0.25E + 0.20T + 0.10A + 0.05C$$

Where:
- **$S$ (Severity Score - 40%)**: Derived from rule-based keyword & hazard signal extraction (0–100).
- **$E$ (Exposure Score - 25%)**: Proximity to public assets via Haversine formula distance bands (0–100).
- **$T$ (Traffic Score - 20%)**: Road type proxy (Arterial: 90, Collector: 70, Local: 45, Residential: 30).
- **$A$ (Complaint Age Score - 10%)**: Elapsed pending duration (0-1d: 20, 2-3d: 40, 4-7d: 60, 8-14d: 80, 15+d: 100).
- **$C$ (Crew Proximity Score - 5%)**: Distance to nearest available crew (<2km: 100, 2-5km: 75, 5-10km: 50, >10km: 25, No crew: 0).

### Priority Bands
- **80 – 100**: `CRITICAL` (Red) → *Recommendation: Repair today (Immediate Dispatch)*
- **60 – 79**: `HIGH` (Orange) → *Recommendation: Schedule within 24–48 hours*
- **40 – 59**: `MEDIUM` (Yellow) → *Recommendation: Include in weekly patch schedule*
- **0 – 39**: `LOW` (Green) → *Recommendation: Monitor condition during routine inspection*

---

## 8. Setup & Installation Instructions

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
1. Install dependencies across root, server, and client:
   ```bash
   npm install
   npm --prefix server install
   npm --prefix client install
   ```

2. Configure environment variables in `server/.env`:
   ```env
   DATABASE_URL="file:../prisma/dev.db"
   PORT=5000
   CLIENT_URL="http://localhost:5173"
   ```

3. Generate Prisma client & push schema:
   ```bash
   npm run prisma:generate
   npm run prisma:push
   ```

4. Seed 50 synthetic complaints, 3 wards, 2 crews, and road assets:
   ```bash
   npm run prisma:seed
   ```

5. Run unit tests for priority engine:
   ```bash
   npm run test
   ```

6. Start both backend & frontend concurrently:
   ```bash
   npm run dev
   ```
   - Command Center UI: `http://localhost:5173`
   - Express API Server: `http://localhost:5000`

---

## 9. API Endpoints
- `GET /api/dashboard/summary` — Returns KPI statistics & chart aggregations.
- `GET /api/complaints` — List complaints with filters (`wardId`, `status`, `search`).
- `GET /api/complaints/:id` — Single complaint details.
- `POST /api/complaints` — Submit complaint and trigger instant priority scoring.
- `GET /api/work-orders` — List work orders sorted by priority score DESC.
- `GET /api/work-orders/:id` — Detailed explainable work order decision breakdown.
- `POST /api/work-orders/:id/calculate-priority` — Recalculate priority.
- `GET /api/crews` — Operational status of repair crews.
- `GET /api/map/work-orders` — Geo-located markers for Leaflet map.

---

## 10. Demo Flow for Hackathon Judges
1. Open `/dashboard` (Municipal Command Center).
2. Observe 50 seeded complaints, 8 Critical, 15 High, 2 Active Crews.
3. Click on the highest-priority work order in the **PRIORITY QUEUE**.
4. Inspect the **FACTOR BREAKDOWN** progress bars and **WHY THIS WAS PRIORITIZED** reasons checklist.
5. Explore the **GEOGRAPHIC COMMAND MAP** markers and nearby school/hospital assets.
6. Navigate to `/report` and click a quick demo location preset (e.g. Near St. Xavier School).
7. Enter a complaint: *"Deep pothole near school entrance causing danger to two-wheelers."*
8. Click **SUBMIT COMPLAINT**. View the instant **COMPLAINT RECEIVED** modal showing calculated severity, priority score, and reasons.
9. Return to the Command Center to see the new complaint automatically ranked in the queue.

---

## 11. Limitations & Future Roadmap
- **Synthetic Dataset**: All 50 complaints, wards, and assets use realistic synthetic data for demonstration.
- **Prototype Weights**: Scoring weights are configurable prototype assumptions.
- **Phase 1 Decision Support**: System assists municipal officers with explainable recommendations; human officers remain final decision-makers.

### Future Roadmap
- **Phase 2**: Advanced crew scheduling & daily route optimization algorithms.
- **Phase 3**: Machine learning computer vision severity classification from citizen uploaded photos.
- **Phase 4**: Municipal SLA tracking & contractor performance audit trails.
- **Phase 5**: City-wide budget allocation & emergency weather mode simulations.
