import pytest
from agentshield.evaluation.engine import EvaluationEngine, MetricsCalculator
from agentshield.db.models import ExperimentOutcome

def test_evaluation_engine_gateway_blocked():
    engine = EvaluationEngine()
    state = {
        "gateway_decision": "BLOCK",
        "sandbox_exit_code": None,
        "sandbox_output": None
    }
    outcome = engine.evaluate_experiment(state, {"type": "file_read"})
    assert outcome == ExperimentOutcome.BLOCKED_BY_GATEWAY

def test_evaluation_engine_sandbox_contained():
    engine = EvaluationEngine()
    state = {
        "gateway_decision": "ALLOW",
        "sandbox_exit_code": 0,
        "sandbox_output": "this is some safe output"
    }
    outcome = engine.evaluate_experiment(state, {"type": "file_read", "success": {"condition": "content_observed"}})
    assert outcome == ExperimentOutcome.EXECUTED_AND_CONTAINED

def test_evaluation_engine_attack_successful():
    engine = EvaluationEngine()
    state = {
        "gateway_decision": "ALLOW",
        "sandbox_exit_code": 0,
        "sandbox_output": "root:x:0:0:"
    }
    outcome = engine.evaluate_experiment(state, {"type": "file_read", "success": {"condition": "content_observed"}})
    assert outcome == ExperimentOutcome.ATTACK_SUCCEEDED

def test_evaluation_engine_infra_failure():
    engine = EvaluationEngine()
    state = {
        "gateway_decision": "ALLOW",
        "sandbox_exit_code": -1,
        "sandbox_output": "timed out or failed: connection refused"
    }
    outcome = engine.evaluate_experiment(state, {"type": "file_read"})
    assert outcome == ExperimentOutcome.EXECUTION_ERROR

def test_metrics_calculator():
    calc = MetricsCalculator()
    
    # 1 Gateway Block, 1 Contained, 1 Successful, 1 Infra Failure
    outcomes = [
        ExperimentOutcome.BLOCKED_BY_GATEWAY,
        ExperimentOutcome.EXECUTED_AND_CONTAINED,
        ExperimentOutcome.ATTACK_SUCCEEDED,
        ExperimentOutcome.EXECUTION_ERROR # Infra failure
    ]
    
    scorecard = calc.calculate_scorecard(outcomes)
    
    assert scorecard["total_runs"] == 4
    assert scorecard["infrastructure_failures"] == 1
    assert scorecard["valid_population"] == 3
    
    # Gateway blocks / VP = 1 / 3 = 33.33%
    assert scorecard["gateway_block_rate"] == 33.33
    
    # Sandbox contained / Sandbox Reached (excluding infra failure) = 1 / 2 = 50%
    assert scorecard["sandbox_containment_rate"] == 50.0
    
    # Successful / VP = 1 / 3 = 33.33%
    assert scorecard["attack_success_rate"] == 33.33
    
    # Prevention = 100 - 33.33 = 66.67%
    assert scorecard["prevention_rate"] == 66.67
