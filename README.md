# URATRO // Autonomous Smart Metro & Operations Management System

> **Enterprise-grade Transit Operations & Analytical Command Platform**  
> Engineered with **MySQL 8.0 (3NF/BCNF)**, **FastAPI (Python 3.13)**, and **React 19 + Three.js WebGL**.

---

## 🎯 Problem Statement & Solution

### The Problem
High-density metropolitan rail transit networks face severe operational bottlenecks:
* **Fragmented Commuter Ledgers:** Inconsistent transactions across smart cards and single-journey tokens cause fare evasion and balance reconciliation delays.
* **Delayed Emergency Response:** Traditional models blur mechanical rolling-stock failures with station-level security crises, impeding rapid dispatch and safety protocols.
* **Operational Blind Spots:** Control rooms lack real-time visibility into Origin-Destination commuter migrations, Mean Time Between Failures (MTBF), and track segment degradation.

### The Solution: URATRO
**URATRO** automates and unifies the transit network through a high-performance database and tactical control suite:
* **Atomic Turnstile Execution:** MySQL stored procedures (`sp_TapInPassenger`, `sp_TapOutPassenger`) enforce minimum balances, prevent duplicate entries, and dynamically compute distance-based fares.
* **ISA-Classified Incident Hierarchy:** Decouples technical/fleet failures (`Emergency_Incident`) from station safety events (`Security_Incident`), triggering autonomous MySQL triggers that lock compromised tracks and schedule repairs.
* **OLAP Analytics Suite:** Native indexed SQL views compute Origin-Destination matrices, hourly bottleneck heatmaps, and route profitability yields in real time.
* **Tactical Command Center:** Operationalized through a 360° 3D WebGL digital twin, live HUD telemetry, and retro-tactical post-processing shaders.

---

## 🌟 Visual Showcase: `unbelievablycrap.com` Recreation
The landing hero is a 1:1 tactical recreation of [unbelievablycrap.com](https://www.unbelievablycrap.com/) (Awwwards SOTD by Liubomyr Ulytskyi), featuring:
* **Custom 3D Metro Rake GLB Model** (`metro-model.glb`) with dynamic mouse-parallax tilt and auto-rotation.
* **Retro-Tactical Shader Pipeline**: Bayer matrix ordered dithering, chromatic aberration (RGB channel splitting), CRT scanlines, and screen vignette.
* **Tactical Wireframe HUD**:
  * Top-Left: Mini radar box with live `X: [mouse.x]`, `Y: [mouse.y]` cursor coordinates.
  * Top-Right: Monospace telemetry matrix (`[URATRO.SYS]`) tracking grid frequency, signal integrity, and line capacity.
  * Mid-Screen: Corner brackets displaying actual Jaipur Metro GPS coordinates (`26.8500° N`, `75.7600° E`).
  * Bottom-Left: Protocol warning block with a `000 / 180` tick-mark slider.
  * Bottom Dock: Uratro logo badge, navigation pill tabs, live digital clock (`GMT+5:30`), and `DISPATCH ALERT +` CTA.

---

## 🧭 Operational Navigation Tabs

| Tab | Role | Underlying Database Mechanics |
| :--- | :--- | :--- |
| **`INDEX +`** | 3D Hero Landing Page | WebGL Three.js Digital Twin + Post-Processing Shaders |
| **`TOPOLOGY +`** | 2D Schematic Transit Map | Pink Line & Blue Line station sequence routing & health |
| **`ANALYTICS +`** | Data Analyst Command Center | Backed by `vw_OriginDestinationMatrix`, `vw_StationHourlyCongestion`, `vw_FleetHealthAnalytics`, and `vw_RouteFinancialYield` |
| **`FLEET +`** | Rolling Stock & Schedules | Timetable schedules (`Daily_Train_Schedule`) & Maintenance Kanban (`Maintenance_Job`) |
| **`INCIDENTS +`** | ISA Specialization Hierarchy | Technical emergencies vs. Station security events with live resolution actions |
| **`SIMULATOR +`** | Turnstile Sandbox | Live execution of stored procedures `sp_TapInPassenger` and `sp_TapOutPassenger` with real-time balance deductions |

---

## ⚡ Quick Start

### One-Click Launch (Windows)
Double-click:
```bat
start_uratro.bat
```

### Manual Execution

1. **Start Backend**:
   ```bash
   cd backend
   python run.py
   ```
   * API: `http://localhost:8000`
   * Swagger Docs: `http://localhost:8000/docs`

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev -- --port 3000
   ```
   * Interface: `http://localhost:3000`

---

## 🗄️ Database Architecture
All database scripts are located in `database/`:
* `schema.sql`: 13 relational tables in 3NF / BCNF.
* `procedures_and_triggers.sql`: Stored procedures (`sp_TapInPassenger`, `sp_TapOutPassenger`) and triggers (`trg_EmergencyIncident_AutoCascade`, `trg_Maintenance_AutoRestore`).
* `views.sql`: High-performance analytical views for OLAP reporting.
* `seed.sql`: Realistic mock dataset for testing and verification.
* `setup_database.py`: Automated Python runner to initialize or reset the entire database.
