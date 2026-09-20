import asyncio
import httpx
import json
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from agentshield.db.session import AsyncSessionLocal
from agentshield.db.models import Evaluation, AttackScenario, ScenarioRun, Attempt, ExecutionRun, Evidence, ExperimentOutcome

async def run_byoa_evaluation(eval_id: int, agent_url: str, queue: asyncio.Queue = None):
    """
    Runner for external Bring Your Own Agent (BYOA) endpoints.
    Bypasses local A/B/C/D sandbox execution completely.
    """
    if queue:
        await queue.put(f"Starting BYOA Evaluation for URL: {agent_url}")
        
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(AttackScenario).where(AttackScenario.is_active == True))
        scenarios = result.scalars().all()
        
        for scenario in scenarios:
            if queue:
                await queue.put(f"Running scenario: {scenario.category}")
            
            # Create Scenario Run
            scenario_run = ScenarioRun(eval_id=eval_id, scenario_id=scenario.id, status="STARTED")
            session.add(scenario_run)
            await session.commit()
            await session.refresh(scenario_run)
            
            # Create Attempt (no local generation, we just use the prompt directly)
            attempt = Attempt(
                scenario_run_id=scenario_run.id,
                generated_code="BYOA_REMOTE_EXECUTION",
                artifact_sha256="BYOA",
                is_valid=True
            )
            session.add(attempt)
            await session.commit()
            await session.refresh(attempt)
            
            # Single Execution Run under config 'REMOTE'
            execution = ExecutionRun(
                attempt_id=attempt.id,
                config_id="REMOTE"
            )
            session.add(execution)
            await session.commit()
            await session.refresh(execution)
            
            # Send HTTP request
            payload = {"message": scenario.prompt}
            response_text = ""
            status_code = None
            error_message = None
            
            try:
                async with httpx.AsyncClient(timeout=10.0, follow_redirects=False) as client:
                    resp = await client.post(agent_url, json=payload)
                    status_code = resp.status_code
                    response_text = resp.text
            except Exception as e:
                error_message = str(e)
                
            # Grade it using the remote evaluator
            from agentshield.evaluation.engine import EvaluationEngine
            eval_engine = EvaluationEngine()
            
            pseudo_state = {
                "remote_response": response_text,
                "remote_status_code": status_code,
                "remote_error": error_message
            }
            
            outcome = eval_engine.evaluate_remote_response(pseudo_state, scenario.evaluator_config)
            
            execution.primary_outcome = outcome
            session.add(execution)
            
            # Store evidence
            evidence = Evidence(
                execution_id=execution.id,
                json_payload={
                    "request": payload,
                    "response_text": response_text,
                    "status_code": status_code,
                    "error_message": error_message
                }
            )
            session.add(evidence)
            
            scenario_run.status = "COMPLETED"
            session.add(scenario_run)
            await session.commit()
            
            if queue:
                await queue.put(f"[REMOTE] Outcome: {outcome.value}")
                
        # Finalize
        eval_obj = await session.get(Evaluation, eval_id)
        if eval_obj:
            eval_obj.status = "COMPLETED"
            session.add(eval_obj)
            await session.commit()
            
        if queue:
            await queue.put("DONE")
