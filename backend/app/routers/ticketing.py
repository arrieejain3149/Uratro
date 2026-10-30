from fastapi import APIRouter, HTTPException
from app.database import get_db
from app.schemas import TapInRequest, TapOutRequest

router = APIRouter(prefix="/api/v1/ticketing", tags=["Ticketing & Commuters"])

@router.get("/passengers")
def list_passengers():
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM Passenger ORDER BY Passenger_ID ASC;")
            return {"status": "success", "data": cur.fetchall()}

@router.get("/active-journeys")
def active_journeys():
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT t.Ticket_ID, t.Passenger_ID, p.Name AS Passenger_Name,
                       s.Name AS Entry_Station, t.Entry_Time, t.Payment_Method
                FROM Ticket t
                JOIN Passenger p ON t.Passenger_ID = p.Passenger_ID
                JOIN Station s ON t.Entry_Station_ID = s.Station_ID
                WHERE t.Exit_Time IS NULL
                ORDER BY t.Entry_Time DESC;
            """)
            return {"status": "success", "data": cur.fetchall()}

@router.get("/history")
def journey_history():
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT t.Ticket_ID, p.Name AS Passenger_Name,
                       s_in.Name AS Entry_Station, s_out.Name AS Exit_Station,
                       t.Entry_Time, t.Exit_Time, t.Fare, t.Payment_Method
                FROM Ticket t
                JOIN Passenger p ON t.Passenger_ID = p.Passenger_ID
                JOIN Station s_in ON t.Entry_Station_ID = s_in.Station_ID
                LEFT JOIN Station s_out ON t.Exit_Station_ID = s_out.Station_ID
                ORDER BY t.Ticket_ID DESC
                LIMIT 50;
            """)
            return {"status": "success", "data": cur.fetchall()}

@router.post("/tap-in")
def tap_in(req: TapInRequest):
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CALL sp_TapInPassenger(%s, %s, %s, @ticket_id, @status_code, @message);
            """, (req.passenger_id, req.station_id, req.payment_method))
            cur.execute("SELECT @ticket_id AS ticket_id, @status_code AS status_code, @message AS message;")
            result = cur.fetchone()

            if result["status_code"] != "TAP_IN_SUCCESS":
                raise HTTPException(status_code=400, detail=result["message"])

            # Fetch updated passenger
            cur.execute("SELECT * FROM Passenger WHERE Passenger_ID = %s;", (req.passenger_id,))
            passenger = cur.fetchone()

            return {
                "status": "success",
                "ticket_id": result["ticket_id"],
                "status_code": result["status_code"],
                "message": result["message"],
                "passenger": passenger
            }

@router.post("/tap-out")
def tap_out(req: TapOutRequest):
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CALL sp_TapOutPassenger(%s, %s, @fare, @new_balance, @status_code, @message);
            """, (req.ticket_id, req.exit_station_id))
            cur.execute("SELECT @fare AS fare, @new_balance AS new_balance, @status_code AS status_code, @message AS message;")
            result = cur.fetchone()

            if result["status_code"] != "TAP_OUT_SUCCESS":
                raise HTTPException(status_code=400, detail=result["message"])

            return {
                "status": "success",
                "fare": float(result["fare"]) if result["fare"] is not None else 0.0,
                "new_balance": float(result["new_balance"]) if result["new_balance"] is not None else 0.0,
                "status_code": result["status_code"],
                "message": result["message"]
            }
