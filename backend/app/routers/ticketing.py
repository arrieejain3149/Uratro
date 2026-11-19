from fastapi import APIRouter, HTTPException
from app.database import get_db
from app.schemas import TapInRequest, TapOutRequest, TicketBookingRequest, WalletTopUpRequest

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

@router.get("/passenger/{passenger_id}/tickets")
def get_passenger_tickets(passenger_id: int):
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT t.Ticket_ID, t.Passenger_ID, p.Name AS Passenger_Name,
                       s_in.Station_ID AS Entry_Station_ID, s_in.Name AS Entry_Station,
                       s_out.Station_ID AS Exit_Station_ID, s_out.Name AS Exit_Station,
                       t.Entry_Time, t.Exit_Time, t.Fare, t.Payment_Method
                FROM Ticket t
                JOIN Passenger p ON t.Passenger_ID = p.Passenger_ID
                JOIN Station s_in ON t.Entry_Station_ID = s_in.Station_ID
                LEFT JOIN Station s_out ON t.Exit_Station_ID = s_out.Station_ID
                WHERE t.Passenger_ID = %s
                ORDER BY t.Ticket_ID DESC;
            """, (passenger_id,))
            tickets = cur.fetchall()
            return {"status": "success", "data": tickets}

@router.post("/book")
def book_ticket(req: TicketBookingRequest):
    with get_db() as conn:
        with conn.cursor() as cur:
            # 1. Check passenger exists
            cur.execute("SELECT * FROM Passenger WHERE Passenger_ID = %s;", (req.passenger_id,))
            passenger = cur.fetchone()
            if not passenger:
                raise HTTPException(status_code=404, detail="Passenger not found.")

            # 2. Check balance if using Smart Card
            if req.payment_method == "Smart Card":
                current_bal = float(passenger.get("Card_Balance", 0.0) or 0.0)
                if current_bal < req.fare:
                    raise HTTPException(status_code=400, detail=f"Insufficient balance (₹{current_bal:.2f}). Please top up.")

            # 3. Insert into Ticket
            cur.execute("""
                INSERT INTO Ticket (Passenger_ID, Entry_Station_ID, Exit_Station_ID, Entry_Time, Exit_Time, Fare, Payment_Method)
                VALUES (%s, %s, %s, NOW(), DATE_ADD(NOW(), INTERVAL 25 MINUTE), %s, %s);
            """, (req.passenger_id, req.entry_station_id, req.exit_station_id, req.fare, req.payment_method))
            ticket_id = cur.lastrowid

            # 4. Deduct balance if Smart Card
            new_balance = float(passenger.get("Card_Balance", 0.0) or 0.0)
            if req.payment_method == "Smart Card":
                cur.execute("""
                    UPDATE Passenger 
                    SET Card_Balance = GREATEST(0, Card_Balance - %s)
                    WHERE Passenger_ID = %s;
                """, (req.fare, req.passenger_id))
                new_balance = max(0.0, new_balance - req.fare)

            # 5. Fetch station names
            cur.execute("SELECT Name FROM Station WHERE Station_ID = %s;", (req.entry_station_id,))
            entry_stn = cur.fetchone()
            cur.execute("SELECT Name FROM Station WHERE Station_ID = %s;", (req.exit_station_id,))
            exit_stn = cur.fetchone()

            return {
                "status": "success",
                "ticket_id": ticket_id,
                "passenger_id": req.passenger_id,
                "passenger_name": passenger["Name"],
                "entry_station": entry_stn["Name"] if entry_stn else f"Station #{req.entry_station_id}",
                "exit_station": exit_stn["Name"] if exit_stn else f"Station #{req.exit_station_id}",
                "fare": req.fare,
                "payment_method": req.payment_method,
                "new_balance": new_balance,
                "message": "Ticket issued successfully."
            }

@router.post("/topup")
def topup_wallet(req: WalletTopUpRequest):
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Top up amount must be positive.")
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE Passenger 
                SET Card_Balance = Card_Balance + %s 
                WHERE Passenger_ID = %s;
            """, (req.amount, req.passenger_id))
            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Passenger not found.")
            cur.execute("SELECT Card_Balance FROM Passenger WHERE Passenger_ID = %s;", (req.passenger_id,))
            updated = cur.fetchone()
            return {
                "status": "success",
                "passenger_id": req.passenger_id,
                "new_balance": float(updated["Card_Balance"]),
                "message": f"Successfully added ₹{req.amount:.2f}."
            }

