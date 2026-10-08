# MUNICIPAL ROAD-REPAIR WORK-ORDER PRIORITIZER & CREW-SCHEDULER
> *"Turning road complaints into explainable repair decisions, optimized field dispatch, and verifiable operational intelligence."*

---

## 1. Project Overview
The **Municipal Road-Repair Work-Order Prioritizer & Crew-Scheduler** is a municipal decision-support and field-operations platform designed for city operations officers, supervisors, and field repair crews. City authorities receive hundreds of road damage reports daily but operate with limited repair crews. The platform resolves three fundamental questions:

1. **Phase 1**: *"What should the municipality repair first?"* (Explainable 5-factor priority engine & command map)
2. **Phase 2**: *"Which crew should handle it and how should the day be planned?"* (Greedy suitability crew assignment & daily route planning)
3. **Phase 3**: *"Did the work actually happen, what happened in the field, and what can we learn from it?"* (Field crew mobile workspace, photo evidence verification, actual repair duration variance, OSRM road network routing, operational analytics, and deterministic hotspot clustering)

---

## 2. Complete Operational Lifecycle

```
COMPLAINT
    ↓
PRIORITY ENGINE (40% Severity + 25% Exposure + 20% Traffic + 10% Age + 5% Proximity)
    ↓
WORK ORDER
    ↓
CREW ASSIGNMENT & DAILY PLANNER
    ↓
FIELD DISPATCH & MOBILE WORKSPACE (/field)
    ↓
START WORK (actualStartTime recorded)
    ↓
FIELD EVIDENCE (Before & After Photos uploaded via Firebase Storage)
    ↓
COMPLETE WORK (actualDuration & completionNotes saved)
    ↓
ACTUAL PERFORMANCE & VARIANCE (Estimated vs Actual repair duration)
    ↓
HISTORICAL REPAIR RECORDS
    ↓
RECURRING HOTSPOT DETECTION (Deterministic 150m geographic clustering)
    ↓
OPERATIONAL INTELLIGENCE
```

---

## 3. Core Features & Capabilities

### Phase 1: Prioritizer & Command Center
- **Rule-Based Severity Engine**: Keyword extraction for structural hazards, collapse, sinkholes, and accident risks.
- **Geographic Public Exposure Engine**: Haversine proximity calculations to schools, hospitals, bus terminals, and markets.
- **Traffic Importance Proxy**: Road classification weights (Arterial: 90, Collector: 70, Local: 45, Residential: 30).
- **Backlog Urgency & Proximity**: Complaint age escalation and repair crew proximity scoring.
- **Explainable Decision Engine**: 0–100 Priority Score with explicit "WHY" checklist reasons.
- **Geographic Command Map**: Interactive Leaflet visual command center.

### Phase 2: Crew Scheduler & Daily Plan Generator
- **Crew Suitability Engine**: Multi-factor scoring combining geographic travel distance, workload capacity, crew specialization match, and priority urgency.
- **Daily Plan Generator**: Automatically sequences daily work plans for active crews within daily capacities.
- **Assignment Override**: Allows municipal officers to manually reassign crews with audit trail logging.
- **Route Sequencing**: Sequential stop ordering from crew origin to work order destinations.

### Phase 3: Field Execution, Verification & Operational Analytics
- **Authentication & Roles**: Firebase Authentication with role-based permissions (`OFFICER`, `SUPERVISOR`, `FIELD_CREW`).
- **Field Crew Mobile Workspace (`/field`)**: Clean, mobile-first interface showing assigned jobs, distance, scheduled start, and job actions without complicated officer metrics.
- **Job Start & Real-Time Tracking**: Records `actualStartTime` upon field dispatch.
- **Before/After Photo Evidence**: Integrates Firebase Cloud Storage for photo verification (`complaints/`, `work-orders/{id}/before/`, `work-orders/{id}/after/`).
- **Work Order Completion**: Captures `actualCompletedTime`, calculates `actualDuration`, and stores structured `completionNotes`.
- **Road Network Routing Service**: OSRM API integration for real driving routes, distance, and duration, with automatic Haversine fallback engine.
- **Operational Analytics (`/analytics`)**: Live database metrics across 4 tabbed views:
  - *Operations*: Total completed, pending, average repair duration variance (Estimated vs Actual).
  - *Crews*: Completion rates, repair duration averages, capacity utilization, travel distance.
  - *Wards*: Ward damage metrics, critical count, completion status, average priority.
  - *Hotspots*: Clustered road problem areas.
- **Deterministic Hotspot Detection (`/hotspots`)**: Clusters citizen complaints within a 150m radius to identify underlying structural infrastructure failures without black-box ML.

---

## 4. Priority Scoring Formula

$$\text{Priority Score } (P) = 0.40S + 0.25E + 0.20T + 0.10A + 0.05C$$

- **$S$ (Severity Score - 40%)**: Derived from keyword & hazard signal extraction (0–100).
- **$E$ (Exposure Score - 25%)**: Proximity to public assets via Haversine formula distance bands (0–100).
- **$T$ (Traffic Score - 20%)**: Road classification (Arterial: 90, Collector: 70, Local: 45, Residential: 30).
- **$A$ (Complaint Age Score - 10%)**: Elapsed pending duration.
- **$C$ (Crew Proximity Score - 5%)**: Distance to nearest available repair crew.

---

## 5. Tech Stack & Architecture

```
[ Field Crew Mobile / Officer Desktop ]
                 ↓
  React 18 + Vite + Tailwind CSS + Leaflet (Frontend)
                 ↓ HTTP REST API
  Express + TypeScript API Server
                 ↓
  OSRM Routing Service + Firebase Auth / Storage + Priority Engine
                 ↓
  Prisma ORM
                 ↓
  SQLite Database (dev.db)
```

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Leaflet & React Leaflet, Recharts, Firebase Client SDK.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, Vitest, OSRM Routing Engine.
- **Database**: SQLite (`prisma/dev.db`).
- **Cloud Services**: Firebase Authentication & Firebase Cloud Storage (`zenzy-9a7dd`).

---

## 6. Setup & Execution Instructions

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
1. Install root, client, and server dependencies:
   ```bash
   npm install
   npm --prefix server install
   npm --prefix client install
   ```

2. Generate Prisma client & sync database:
   ```bash
   npm run prisma:generate
   npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss
   ```

3. Seed 50 realistic complaints, 3 wards, 2 crews, assets, and hotspots:
   ```bash
   npm run prisma:seed
   ```

4. Start backend API server and React frontend concurrently:
   ```bash
   npm run dev
   ```
   - Frontend Application: `http://localhost:5173`
   - Express API Server: `http://localhost:5000`

---

## 7. API Endpoints

### Auth
- `POST /api/auth/sync-user` — Synchronize Firebase authenticated user with User database table.
- `GET /api/auth/me` — Retrieve current user profile and role details.

### Operations & Planning
- `GET /api/dashboard/summary` — Overview metrics for Municipal Operations Command Center.
- `GET /api/complaints` — List citizen complaints with filters (`wardId`, `status`, `search`).
- `POST /api/complaints` — Submit new complaint with instant priority engine scoring.
- `GET /api/work-orders` — Priority queue of work orders sorted by priority score DESC.
- `GET /api/daily-plan` — Get current daily work plan.
- `POST /api/daily-plan/generate` — Trigger crew assignment and daily plan generation.
- `POST /api/work-orders/:id/assign` — Manual crew assignment override.

### Field Crew Execution (Phase 3)
- `GET /api/field/today` — Fetch today's assigned jobs and route for field crew workspace.
- `POST /api/work-orders/:id/start` — Mark work order IN_PROGRESS & record actualStartTime.
- `POST /api/work-orders/:id/complete` — Complete work order, record duration & completion notes.
- `POST /api/work-orders/:id/evidence` — Store BEFORE / AFTER photo evidence metadata.

### Routing & Analytics (Phase 3)
- `GET /api/routes/estimate` — OSRM road network route calculation with Haversine fallback.
- `GET /api/daily-plan/route` — Full daily plan multi-stop route geometry.
- `GET /api/analytics/operations` — Overall operational KPI metrics and repair duration variance.
- `GET /api/analytics/crews` — Crew performance, completion rates, and capacity utilization.
- `GET /api/analytics/wards` — Ward-by-ward complaint breakdown and hotspot summary.
- `GET /api/hotspots` — List recurring road hotspots detected by 150m spatial clustering.
- `POST /api/hotspots/recalculate` — Trigger recalculation of geographic hotspots across complaints.

---

## 8. End-to-End Demo Guide for Hackathon Judges

1. **Officer Login & Command Center (`/dashboard`)**:
   - Log in as Officer (`officer@municipal.gov`).
   - Observe real DB metrics: 50 Seeded Complaints, Critical/High Priority Work Orders, Active Crews.

2. **Daily Work Plan Generation (`/daily-plan`)**:
   - Click **GENERATE TODAY'S DAILY PLAN**.
   - Review crew stop sequences (Stop #1, Stop #2, etc.), estimated durations, and travel distances.

3. **Field Crew Dispatch & Execution (`/field`)**:
   - Switch role to **FIELD CREW 01** using the top header role switcher or login.
   - Observe mobile-first UI showing **CREW 01 TODAY'S WORK PLAN**.
   - Select **NEXT UP** job (`WO-031` / `WO-001`).
   - Click **START JOB**. Status updates to `IN_PROGRESS` and `actualStartTime` is recorded.
   - Upload **AFTER PHOTO EVIDENCE** URL and add completion notes (*"Damaged asphalt resurfaced, leveled, and sealed."*).
   - Click **MARK REPAIR COMPLETE**. Status transitions to `COMPLETED`.

4. **Verify Evidence & Performance (`/work-orders`)**:
   - Return to Officer role. Select the completed work order.
   - Inspect **BEFORE / AFTER PHOTO EVIDENCE** side-by-side gallery and view **Actual Duration (e.g. 118 min)** vs **Estimated Duration (90 min)**.

5. **Operational Analytics (`/analytics`)**:
   - Open `/analytics`. Explore the **Operations**, **Crews**, **Wards**, and **Hotspots** tabs.
   - Review system-generated dynamic insights and duration variance calculations.

6. **Recurring Road Hotspots (`/hotspots`)**:
   - Open `/hotspots`. View spatial clusters with 2+ complaints within 150m.
   - Click **RECALCULATE HOTSPOTS** to trigger live spatial clustering across database records.
