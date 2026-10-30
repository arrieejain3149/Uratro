from fastapi import APIRouter, HTTPException
from app.database import get_db
from app.schemas import EmergencyIncidentCreate, SecurityIncidentCreate

router = APIRouter(prefix="/api/v1/incidents", tags=["Incidents (ISA Hierarchy)"])

@router.get("/emergency")
def list_emergency_incidents():
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT e.Incident_ID, e.Breakdown, e.Power, e.Signal_Failure,
                       e.Timestamp, e.Location_Description, e.Resolution_Status,
                       m.Metro_ID, m.Model AS Metro_Model, m.Current_Status AS Metro_Status,
                       t.Track_ID, t.Condition_Status AS Track_Status,
                       emp.Name AS Reporter_Name
                FROM Emergency_Incident e
                JOIN Metro m ON e.Metro_ID = m.Metro_ID
                JOIN Track t ON e.Track_ID = t.Track_ID
                JOIN Employee emp ON e.Reporter_Emp_ID = emp.Emp_ID
                ORDER BY e.Timestamp DESC;
            """)
            return {"status": "success", "data": cur.fetchall()}

@router.post("/emergency")
def report_emergency_incident(req: EmergencyIncidentCreate):
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO Emergency_Incident 
                (Metro_ID, Track_ID, Reporter_Emp_ID, Breakdown, Power, Signal_Failure, Timestamp, Location_Description, Resolution_Status)
                VALUES (%s, %s, %s, %s, %s, %s, NOW(), %s, 'Pending');
            """, (req.metro_id, req.track_id, req.reporter_emp_id, req.breakdown, req.power, req.signal_failure, req.location_description))
            incident_id = cur.lastrowid
            return {"status": "success", "incident_id": incident_id, "message": "Emergency Incident logged. Autonomous triggers executed."}

@router.put("/emergency/{incident_id}/resolve")
def resolve_emergency(incident_id: int):
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("UPDATE Emergency_Incident SET Resolution_Status = 'Resolved' WHERE Incident_ID = %s;", (incident_id,))
            return {"status": "success", "message": f"Incident {incident_id} marked as Resolved."}

@router.get("/security")
def list_security_incidents():
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT s.Security_Inc_ID, s.Incident_Type, s.Timestamp, s.Details, s.Resolution_Status,
                       st.Name AS Station_Name, st.Type AS Station_Type,
                       emp.Name AS Reporter_Name
                FROM Security_Incident s
                JOIN Station st ON s.Station_ID = st.Station_ID
                JOIN Employee emp ON s.Reporter_Emp_ID = emp.Emp_ID
                ORDER BY s.Timestamp DESC;
            """)
            return {"status": "success", "data": cur.fetchall()}

@router.post("/security")
def report_security_incident(req: SecurityIncidentCreate):
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO Security_Incident 
                (Station_ID, Reporter_Emp_ID, Incident_Type, Timestamp, Details, Resolution_Status)
                VALUES (%s, %s, %s, NOW(), %s, 'Pending');
            """, (req.station_id, req.reporter_emp_id, req.incident_type, req.details))
            incident_id = cur.lastrowid
            return {"status": "success", "incident_id": incident_id, "message": "Security Incident logged."}

@router.put("/security/{incident_id}/resolve")
def resolve_security(incident_id: int):
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("UPDATE Security_Incident SET Resolution_Status = 'Resolved' WHERE Security_Inc_ID = %s;", (incident_id,))
            return {"status": "success", "message": f"Security Incident {incident_id} marked as Resolved."}
