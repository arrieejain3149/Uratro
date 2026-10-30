from fastapi import APIRouter, HTTPException
from app.database import get_db

router = APIRouter(prefix="/api/v1/stations", tags=["Stations & Routes"])

@router.get("")
def list_stations():
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM Station ORDER BY Station_ID ASC;")
            return {"status": "success", "data": cur.fetchall()}

@router.get("/routes")
def list_routes():
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT r.Route_ID, r.Route_Name, 
                       s_start.Name AS Start_Station, s_end.Name AS End_Station
                FROM Route r
                JOIN Station s_start ON r.Start_Station_ID = s_start.Station_ID
                JOIN Station s_end ON r.End_Station_ID = s_end.Station_ID;
            """)
            routes = cur.fetchall()

            # For each route, fetch the sequenced stations
            for route in routes:
                cur.execute("""
                    SELECT s.Station_ID, s.Name, s.Type, s.Status, s.GPS_Coordinates, m.Sequence_Number
                    FROM Route_Station_Mapping m
                    JOIN Station s ON m.Station_ID = s.Station_ID
                    WHERE m.Route_ID = %s
                    ORDER BY m.Sequence_Number ASC;
                """, (route["Route_ID"],))
                route["stations"] = cur.fetchall()

            return {"status": "success", "data": routes}

@router.get("/tracks")
def list_tracks():
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT t.Track_ID, t.Length, t.Condition_Status, r.Route_Name
                FROM Track t
                JOIN Route r ON t.Route_ID = r.Route_ID
                ORDER BY t.Track_ID ASC;
            """)
            return {"status": "success", "data": cur.fetchall()}
