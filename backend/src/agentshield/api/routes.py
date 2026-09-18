import asyncio
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from agentshield.db.session import get_db
from agentshield.db.models import Evaluation, AttackScenario, Experiment, Evidence
from agentshield.runner import run_evaluation_matrix
import json

router = APIRouter()

# Simple in-memory channel for SSE logs
# In production, use Redis pub/sub. For phase 5, in-memory dict works.
sse_queues = {}

@router.post("/evaluations")
async def create_evaluation(background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    """Creates a new evaluation and starts the matrix runner."""
    evaluation = Evaluation(name="Matrix Evaluation", status="RUNNING")
    db.add(evaluation)
    await db.commit()
    await db.refresh(evaluation)
    
    # We will need a way to pass a queue to the runner
    queue = asyncio.Queue()
    sse_queues[evaluation.id] = queue
    
    # Start the matrix runner in the background
    background_tasks.add_task(run_evaluation_matrix, evaluation.id, queue)
    
    return {"id": evaluation.id, "status": "RUNNING"}

@router.get("/evaluations/latest")
async def get_latest_evaluation(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Evaluation).order_by(Evaluation.id.desc()).limit(1))
    evaluation = result.scalars().first()
    if not evaluation:
        raise HTTPException(status_code=404, detail="No evaluations found")
    return {"id": evaluation.id}

@router.get("/evaluations/{eval_id}")
async def get_evaluation(eval_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Evaluation).where(Evaluation.id == eval_id))
    evaluation = result.scalars().first()
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return evaluation

@router.get("/evaluations/{eval_id}/events")
async def evaluation_events(eval_id: int):
    """SSE endpoint for live terminal stream."""
    queue = sse_queues.get(eval_id)
    if not queue:
        # If the evaluation is already done and queue is gone, we could just return empty or error.
        # For simplicity, if it's not active, we return 404 for events.
        raise HTTPException(status_code=404, detail="No active event stream found for this evaluation")
        
    async def event_generator():
        try:
            while True:
                msg = await queue.get()
                if msg == "DONE":
                    yield f"data: {json.dumps({'event': 'DONE'})}\n\n"
                    break
                yield f"data: {json.dumps({'event': 'LOG', 'message': msg})}\n\n"
        except asyncio.CancelledError:
            pass

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/evaluations/{eval_id}/scorecard")
async def get_scorecard(eval_id: int, db: AsyncSession = Depends(get_db)):
    # Retrieve all evidence for experiments belonging to this eval
    result = await db.execute(
        select(Evidence).join(Experiment).where(Experiment.eval_id == eval_id)
    )
    evidences = result.scalars().all()
    
    from agentshield.evaluation.engine import MetricsCalculator
    from agentshield.schema.scenario import EvidenceSchema
    
    schemas = [
        EvidenceSchema(
            attempted=ev.attempted,
            gateway_blocked=ev.gateway_blocked,
            sandbox_reached=ev.sandbox_reached,
            sandbox_contained=ev.sandbox_contained,
            attack_successful=ev.attack_successful,
            sandbox_escape=ev.sandbox_escape,
            successful_data_exfiltration=ev.successful_data_exfiltration
        ) for ev in evidences
    ]
    
    calc = MetricsCalculator()
    return calc.calculate_scorecard(schemas)

@router.get("/experiments/{exp_id}")
async def get_experiment(exp_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Experiment).where(Experiment.id == exp_id))
    experiment = result.scalars().first()
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")
        
    # Also fetch evidence
    ev_result = await db.execute(select(Evidence).where(Evidence.exp_id == exp_id))
    evidence = ev_result.scalars().first()
    
    return {
        "experiment": experiment,
        "evidence": evidence
    }

from pydantic import BaseModel

class ScenarioCreate(BaseModel):
    category: str
    prompt: str
    success_condition: str

@router.get("/scenarios")
async def get_scenarios(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AttackScenario))
    scenarios = result.scalars().all()
    return scenarios

@router.post("/scenarios")
async def create_scenario(scenario: ScenarioCreate, db: AsyncSession = Depends(get_db)):
    new_scenario = AttackScenario(
        category=scenario.category,
        prompt=scenario.prompt,
        success_condition=scenario.success_condition
    )
    db.add(new_scenario)
    await db.commit()
    await db.refresh(new_scenario)
    return new_scenario

@router.put("/scenarios/{scenario_id}/toggle")
async def toggle_scenario(scenario_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AttackScenario).where(AttackScenario.id == scenario_id))
    scenario = result.scalars().first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    scenario.is_active = not scenario.is_active
    db.add(scenario)
    await db.commit()
    await db.refresh(scenario)
    return scenario
