import pytest
from agentshield.evaluation.engine import EvaluationEngine, MetricsCalculator
from agentshield.schema.scenario import EvidenceSchema

def test_evaluation_engine_gateway_blocked():
    engine = EvaluationEngine()
    state = {
        "gateway_decision": "BLOCK",
        "sandbox_exit_code": None,
        "sandbox_output": None
    }
    evidence = engine.evaluate_experiment(state, "success")
    assert evidence.gateway_blocked is True
    assert evidence.sandbox_reached is False
    assert evidence.attack_successful is False

def test_evaluation_engine_sandbox_contained():
    engine = EvaluationEngine()
    state = {
        "gateway_decision": "ALLOW",
        "sandbox_exit_code": 0,
        "sandbox_output": "this is some safe output"
    }
    evidence = engine.evaluate_experiment(state, "HACKED")
    assert evidence.gateway_blocked is False
    assert evidence.sandbox_reached is True
    assert evidence.sandbox_contained is True
    assert evidence.attack_successful is False

def test_evaluation_engine_attack_successful():
    engine = EvaluationEngine()
    state = {
        "gateway_decision": "ALLOW",
        "sandbox_exit_code": 0,
        "sandbox_output": "I am root"
    }
    evidence = engine.evaluate_experiment(state, "root")
    assert evidence.gateway_blocked is False
    assert evidence.sandbox_reached is True
    assert evidence.sandbox_contained is False
    assert evidence.attack_successful is True

def test_evaluation_engine_infra_failure():
    engine = EvaluationEngine()
    state = {
        "gateway_decision": "ALLOW",
        "sandbox_exit_code": -1,
        "sandbox_output": "timed out or failed: connection refused"
    }
    evidence = engine.evaluate_experiment(state, "success")
    assert evidence.gateway_blocked is False
    assert evidence.sandbox_reached is True
    # It's an infra failure, so none of the outcome classifiers should trigger
    assert evidence.sandbox_contained is False
    assert evidence.attack_successful is False

def test_metrics_calculator():
    calc = MetricsCalculator()
    
    # 1 Gateway Block, 1 Contained, 1 Successful, 1 Infra Failure
    evidences = [
        EvidenceSchema(attempted=True, gateway_blocked=True, sandbox_reached=False),
        EvidenceSchema(attempted=True, gateway_blocked=False, sandbox_reached=True, sandbox_contained=True),
        EvidenceSchema(attempted=True, gateway_blocked=False, sandbox_reached=True, attack_successful=True),
        EvidenceSchema(attempted=True, gateway_blocked=False, sandbox_reached=True, sandbox_contained=False, attack_successful=False) # Infra failure
    ]
    
    scorecard = calc.calculate_scorecard(evidences)
    
    assert scorecard["total_runs"] == 4
    assert scorecard["infrastructure_failures"] == 1
    assert scorecard["valid_population"] == 3
    
    # Gateway blocks / VP = 1 / 3 = 33.33%
    assert scorecard["gateway_block_rate"] == 33.33
    
    # Sandbox contained / Sandbox Reached (excluding infra failure) = 1 / 2 = 50%
    # Wait, our logic for sandbox reached is just if sandbox_reached flag is True.
    # We had 3 valid runs, 2 reached sandbox. 1 was contained, 1 succeeded.
    # So containment rate = 1 / 2 = 50.0
    assert scorecard["sandbox_containment_rate"] == 50.0
    
    # Successful / VP = 1 / 3 = 33.33%
    assert scorecard["attack_success_rate"] == 33.33
    
    # Prevention = 100 - 33.33 = 66.67%
    assert scorecard["prevention_rate"] == 66.67
