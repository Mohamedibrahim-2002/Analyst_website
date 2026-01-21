# app/models/response.py
from pydantic import BaseModel
from typing import List, Dict, Any

class Zone(BaseModel):
    level: float

class Scenarios(BaseModel):
    primary: str
    alternate: str
    invalidation: str

class AnalysisResponse(BaseModel):
    asset: str
    timeframe: str
    trend: str
    structure: str
    market_phase: str
    bias: str
    risk: str
    confidence: float

    support_zones: List[Zone]
    resistance_zones: List[Zone]
    scenarios: Scenarios

    current_price: float | None = None

