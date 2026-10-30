from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date

class TapInRequest(BaseModel):
    passenger_id: int
    station_id: int
    payment_method: str = "Smart Card"

class TapOutRequest(BaseModel):
    ticket_id: int
    exit_station_id: int

class EmergencyIncidentCreate(BaseModel):
    metro_id: int
    track_id: int
    reporter_emp_id: int
    breakdown: bool = False
    power: bool = False
    signal_failure: bool = False
    location_description: Optional[str] = None

class SecurityIncidentCreate(BaseModel):
    station_id: int
    reporter_emp_id: int
    incident_type: str
    details: Optional[str] = None

class MaintenanceJobCreate(BaseModel):
    metro_id: int
    component: str
    job_type: str = "Routine"
    scheduled_date: Optional[str] = None
    engineer_ids: Optional[List[int]] = []
