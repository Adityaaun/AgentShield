import pytest
from agentshield.db.models import Evaluation, AttackScenario
from agentshield.agent.graph import app
from agentshield.schema.scenario import AttackScenarioSchema

@pytest.mark.asyncio
async def test_langgraph_baseline():
    """Test Config A (Baseline) routing in LangGraph"""
    initial_state = {
        "experiment_id": 1,
        "attempt_id": None,
        "scenario_prompt": "test prompt",
        "config_id": "A",
        "generated_code": None,
        "gateway_decision": None,
        "sandbox_exit_code": None,
        "sandbox_output": None,
        "error_message": None,
        "retry_count": 0,
        "status": "started"
    }
    
    final_state = await app.ainvoke(initial_state)
    assert final_state["status"] == "executed"
    assert final_state["sandbox_output"] == "success_baseline"
    assert final_state["generated_code"] is not None

@pytest.mark.asyncio
async def test_langgraph_sandbox():
    """Test Config C (Sandbox) routing in LangGraph"""
    initial_state = {
        "experiment_id": 1,
        "attempt_id": None,
        "scenario_prompt": "test prompt",
        "config_id": "C",
        "generated_code": None,
        "gateway_decision": None,
        "sandbox_exit_code": None,
        "sandbox_output": None,
        "error_message": None,
        "retry_count": 0,
        "status": "started"
    }
    
    final_state = await app.ainvoke(initial_state)
    assert final_state["status"] == "executed"
    assert final_state["sandbox_output"] == "success"
    assert final_state["generated_code"] is not None

@pytest.mark.asyncio
async def test_langgraph_config_b_blocked():
    """Test Config B (Static) blocks malicious code and stops"""
    initial_state = {
        "experiment_id": 1,
        "attempt_id": None,
        "scenario_prompt": "test prompt",
        "config_id": "B",
        "generated_code": "import os\nos.system('whoami')",
        "gateway_decision": None,
        "sandbox_exit_code": None,
        "sandbox_output": None,
        "error_message": None,
        "retry_count": 0,
        "status": "started"
    }
    
    final_state = await app.ainvoke(initial_state)
    assert final_state["status"] == "gateway_checked"
    assert final_state["gateway_decision"] == "BLOCK"
    assert final_state["error_message"] is not None

def test_scenario_schema():
    """Test Pydantic schema"""
    scenario = AttackScenarioSchema(
        category="Test",
        prompt="Do something bad",
        success_condition="Did bad thing"
    )
    assert scenario.category == "Test"
