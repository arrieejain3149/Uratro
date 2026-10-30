from fastapi import APIRouter
from app.database import get_db

router = APIRouter(prefix="/api/v1/analytics", tags=["Data Analytics Command Center"])

@router.get("/od-matrix")
def get_od_matrix():
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM vw_OriginDestinationMatrix;")
            return {"status": "success", "data": cur.fetchall()}

@router.get("/congestion-heatmap")
def get_congestion_heatmap():
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM vw_StationHourlyCongestion;")
            return {"status": "success", "data": cur.fetchall()}

@router.get("/fleet-health")
def get_fleet_health():
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM vw_FleetHealthAnalytics;")
            return {"status": "success", "data": cur.fetchall()}

@router.get("/financial-yield")
def get_financial_yield():
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM vw_RouteFinancialYield;")
            return {"status": "success", "data": cur.fetchall()}

@router.get("/kpis")
def get_kpis():
    with get_db() as conn:
        with conn.cursor() as cur:
            # Total revenue
            cur.execute("SELECT COALESCE(SUM(Fare), 0.00) AS total_revenue FROM Ticket;")
            total_rev = cur.fetchone()["total_revenue"]

            # Total commuter trips
            cur.execute("SELECT COUNT(*) AS total_trips FROM Ticket;")
            total_trips = cur.fetchone()["total_trips"]

            # Active vs maintenance rolling stock
            cur.execute("SELECT COUNT(*) AS active_rakes FROM Metro WHERE Current_Status = 'Active';")
            active_rakes = cur.fetchone()["active_rakes"]

            cur.execute("SELECT COUNT(*) AS total_rakes FROM Metro;")
            total_rakes = cur.fetchone()["total_rakes"]

            # Open Emergency Incidents
            cur.execute("SELECT COUNT(*) AS open_emergencies FROM Emergency_Incident WHERE Resolution_Status != 'Resolved';")
            open_emergencies = cur.fetchone()["open_emergencies"]

            # Open Security Incidents
            cur.execute("SELECT COUNT(*) AS open_security FROM Security_Incident WHERE Resolution_Status != 'Resolved';")
            open_security = cur.fetchone()["open_security"]

            return {
                "status": "success",
                "data": {
                    "total_revenue": float(total_rev),
                    "total_trips": total_trips,
                    "active_rakes": active_rakes,
                    "total_rakes": total_rakes,
                    "rake_availability_pct": round((active_rakes / total_rakes * 100), 1) if total_rakes else 100,
                    "open_emergencies": open_emergencies,
                    "open_security": open_security,
                    "grid_frequency_hz": 50.0,
                    "signal_integrity_pct": 99.98
                }
            }
