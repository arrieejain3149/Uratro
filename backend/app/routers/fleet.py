from fastapi import APIRouter
from app.database import get_db

router = APIRouter(prefix="/api/v1/fleet", tags=["Fleet & Operations"])

@router.get("/metros")
def list_metros():
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM Metro ORDER BY Metro_ID ASC;")
            return {"status": "success", "data": cur.fetchall()}

@router.get("/schedules")
def list_schedules():
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT s.Schedule_ID, s.Date, s.Shift, 
                       m.Metro_ID, m.Model AS Metro_Model, m.Current_Status,
                       r.Route_ID, r.Route_Name,
                       e.Emp_ID AS Driver_ID, e.Name AS Driver_Name
                FROM Daily_Train_Schedule s
                JOIN Metro m ON s.Metro_ID = m.Metro_ID
                JOIN Route r ON s.Route_ID = r.Route_ID
                JOIN Employee e ON s.Driver_Emp_ID = e.Emp_ID
                ORDER BY s.Date DESC, s.Schedule_ID ASC;
            """)
            return {"status": "success", "data": cur.fetchall()}

@router.get("/employees")
def list_employees():
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM Employee ORDER BY Emp_ID ASC;")
            return {"status": "success", "data": cur.fetchall()}
