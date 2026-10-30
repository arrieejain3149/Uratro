from fastapi import APIRouter
from app.database import get_db
from app.schemas import MaintenanceJobCreate

router = APIRouter(prefix="/api/v1/maintenance", tags=["Maintenance Operations"])

@router.get("/jobs")
def list_maintenance_jobs():
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT j.Job_ID, j.Component, j.Job_Type, j.Scheduled_Date, j.Resolution_Status,
                       m.Metro_ID, m.Model AS Metro_Model, m.Current_Status AS Metro_Status
                FROM Maintenance_Job j
                JOIN Metro m ON j.Metro_ID = m.Metro_ID
                ORDER BY j.Scheduled_Date DESC;
            """)
            jobs = cur.fetchall()

            for job in jobs:
                cur.execute("""
                    SELECT e.Emp_ID, e.Name AS Engineer_Name, mej.Role_on_Job
                    FROM Maintenance_Engineer_Job mej
                    JOIN Employee e ON mej.Engineer_Emp_ID = e.Emp_ID
                    WHERE mej.Job_ID = %s;
                """, (job["Job_ID"],))
                job["assigned_engineers"] = cur.fetchall()

            return {"status": "success", "data": jobs}

@router.post("/jobs")
def create_maintenance_job(req: MaintenanceJobCreate):
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO Maintenance_Job (Metro_ID, Component, Job_Type, Scheduled_Date, Resolution_Status)
                VALUES (%s, %s, %s, COALESCE(%s, NOW()), 'Scheduled');
            """, (req.metro_id, req.component, req.job_type, req.scheduled_date))
            job_id = cur.lastrowid

            if req.engineer_ids:
                for eid in req.engineer_ids:
                    cur.execute("""
                        INSERT INTO Maintenance_Engineer_Job (Job_ID, Engineer_Emp_ID, Role_on_Job)
                        VALUES (%s, %s, 'Assigned Technician');
                    """, (job_id, eid))

            return {"status": "success", "job_id": job_id, "message": "Work order created successfully."}

@router.put("/jobs/{job_id}/complete")
def complete_maintenance_job(job_id: int):
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("UPDATE Maintenance_Job SET Resolution_Status = 'Completed' WHERE Job_ID = %s;", (job_id,))
            return {"status": "success", "message": f"Job {job_id} marked as Completed. Autonomous triggers executed."}
