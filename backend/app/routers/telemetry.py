from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
import random
import time

router = APIRouter(prefix="/api/v1/telemetry", tags=["Live Telemetry & Simulation"])

# In-memory simulation of active trains running along Pink Line (1-10) and Blue Line (6-8)
train_positions = [
    {"metro_id": 1, "model": "Alstom Metropolis 2020", "route": "Pink Line", "from_st": 1, "to_st": 2, "progress": 0.45, "speed_kmh": 62.4, "direction": 1},
    {"metro_id": 2, "model": "BEML Metro Series-2", "route": "Pink Line", "from_st": 5, "to_st": 6, "progress": 0.80, "speed_kmh": 58.1, "direction": 1},
    {"metro_id": 4, "model": "Hyundai Rotem Express", "route": "Blue Line", "from_st": 7, "to_st": 8, "progress": 0.20, "speed_kmh": 44.7, "direction": 1},
    {"metro_id": 5, "model": "CRRC Vanguard 3000", "route": "Pink Line", "from_st": 9, "to_st": 8, "progress": 0.65, "speed_kmh": 65.0, "direction": -1}
]

@router.get("/live")
def get_live_telemetry():
    return {
        "status": "success",
        "timestamp": time.time(),
        "trains": train_positions,
        "grid_status": "NOMINAL",
        "defcon_level": 1,
        "active_passengers_in_transit": 1248
    }

@router.websocket("/ws")
async def websocket_telemetry(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Advance train positions smoothly
            for train in train_positions:
                train["progress"] += 0.05
                if train["progress"] >= 1.0:
                    train["progress"] = 0.0
                    # Switch stations
                    if train["direction"] == 1:
                        train["from_st"] = train["to_st"]
                        train["to_st"] = min(train["to_st"] + 1, 10 if train["route"] == "Pink Line" else 8)
                        if train["to_st"] == (10 if train["route"] == "Pink Line" else 8):
                            train["direction"] = -1
                    else:
                        train["from_st"] = train["to_st"]
                        train["to_st"] = max(train["to_st"] - 1, 1 if train["route"] == "Pink Line" else 6)
                        if train["to_st"] == (1 if train["route"] == "Pink Line" else 6):
                            train["direction"] = 1
                train["speed_kmh"] = round(55.0 + random.uniform(-10.0, 15.0), 1)

            payload = {
                "timestamp": time.time(),
                "trains": train_positions,
                "grid_frequency_hz": round(50.0 + random.uniform(-0.04, 0.04), 2),
                "power_grid_mw": round(142.5 + random.uniform(-1.5, 2.0), 1)
            }
            await websocket.send_text(json.dumps(payload))
            await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        pass
