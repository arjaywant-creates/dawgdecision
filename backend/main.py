from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from app.decision_engine.models import Scenario, DecisionResult, ComparisonResult
from app.decision_engine.calculations import analyze_scenario
from app.decision_engine.comparison import compare_scenarios

app = FastAPI(title="DawgDecision Engine API")

# Allow requests from the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CompareRequest(BaseModel):
    scenario_a: Scenario
    scenario_b: Scenario

@app.get("/")
def read_root():
    return {"message": "Welcome to DawgDecision Engine API"}

@app.post("/api/analyze", response_model=DecisionResult)
def analyze(scenario: Scenario):
    return analyze_scenario(scenario)

@app.post("/api/compare", response_model=ComparisonResult)
def compare(request: CompareRequest):
    return compare_scenarios(request.scenario_a, request.scenario_b)
