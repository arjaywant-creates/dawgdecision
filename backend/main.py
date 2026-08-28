import json
import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from app.decision_engine.models import Scenario, DecisionResult, ComparisonResult, DecisionImpactResult
from app.decision_engine.calculations import analyze_scenario
from app.decision_engine.comparison import compare_scenarios
from app.decision_engine.impact import analyze_decision_impact

app = FastAPI(title="DawgDecision Engine API")
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Allow requests from the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CompareRequest(BaseModel):
    scenario_a: Scenario
    scenario_b: Scenario

class ImpactRequest(BaseModel):
    scenario_a: Scenario
    scenario_b: Scenario
    selected_scenario: str

@app.get("/")
def read_root():
    return {"message": "Welcome to DawgDecision Engine API"}

@app.post("/api/analyze", response_model=DecisionResult)
def analyze(scenario: Scenario):
    return analyze_scenario(scenario)

@app.post("/api/compare", response_model=ComparisonResult)
def compare(request: CompareRequest):
    return compare_scenarios(request.scenario_a, request.scenario_b)

@app.post("/api/analyze-impact", response_model=DecisionImpactResult)
def analyze_impact(request: ImpactRequest):
    return analyze_decision_impact(
        scenario_a=request.scenario_a,
        scenario_b=request.scenario_b,
        selected_scenario=request.selected_scenario
    )

def get_data_path() -> Path:
    return Path(__file__).resolve().parent.parent / "data" / "housing_sources.json"

_cached_housing_data = None

def get_housing_data():
    global _cached_housing_data
    if _cached_housing_data is not None:
        return _cached_housing_data
        
    data_path = get_data_path()
    if not data_path.exists():
        raise HTTPException(status_code=500, detail="Housing dataset not found")
        
    with open(data_path, "r", encoding="utf-8") as f:
        _cached_housing_data = json.load(f)
        
    return _cached_housing_data

@app.get("/api/housing-sources")
def get_housing_sources():
    data = get_housing_data()
    return JSONResponse(content=data)

@app.get("/api/housing-sources/{id}")
def get_housing_source_by_id(id: str):
    data = get_housing_data()
    for option in data.get("housing_options", []):
        if option.get("id") == id:
            return JSONResponse(content=option)
            
    raise HTTPException(status_code=404, detail="Housing option not found")
