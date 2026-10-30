from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import stations, fleet, ticketing, incidents, maintenance, analytics, telemetry

app = FastAPI(
    title="URATRO // Autonomous Smart Metro & Operations Management API",
    version="1.0.0",
    description="Enterprise REST & WebSocket API for MySQL 8.0 transit database, stored procedures, triggers, and live telemetry."
)

# Enable CORS for Next.js / React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all modular routers
app.include_router(stations.router)
app.include_router(fleet.router)
app.include_router(ticketing.router)
app.include_router(incidents.router)
app.include_router(maintenance.router)
app.include_router(analytics.router)
app.include_router(telemetry.router)

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "online",
        "system": "URATRO Metro OS API",
        "database": "MySQL 8.0 (smart_metro_db)",
        "mode": "tactical_analytics"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main.py:app", host="0.0.0.0", port=8000, reload=True)
