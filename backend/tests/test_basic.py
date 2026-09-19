import pytest
from agentshield.db.models import Evaluation, AttackScenario
from agentshield.agent.graph import app
from agentshield.schema.scenario import AttackScenarioSchema

@pytest.mark.asyncio
async def test_langgraph_baseline():
    """
    Test Config A (Baseline) routing in LangGraph.
    We pre-inject generated_code so the test NEVER calls the real LLM/API.
    This makes the test fast, deterministic, and not quota-dependent.
    """
    initial_state = {
        "experiment_id": 1,
        "attempt_id": None,
        "scenario_prompt": "test prompt",
        "config_id": "A",
        # Pre-inject code to bypass the LLM agent_node entirely
        "generated_code": "print('hello world')",
        "gateway_decision": None,
        "sandbox_exit_code": None,
        "sandbox_output": None,
        "error_message": None,
        "retry_count": 0,
        "status": "started"
    }
    
    final_state = await app.ainvoke(initial_state)
    # Config A goes to baseline_execution which actually executes in Sandbox now
    assert final_state["status"] == "executed"
    assert "hello world" in final_state["sandbox_output"]
    assert final_state["generated_code"] is not None

@pytest.mark.asyncio
async def test_langgraph_sandbox():
    """
    Test Config C (Sandbox only) routing in LangGraph.
    We pre-inject benign code so Docker actually runs it, skipping the LLM.
    """
    initial_state = {
        "experiment_id": 1,
        "attempt_id": None,
        "scenario_prompt": "test prompt",
        "config_id": "C",
        # Pre-inject benign code — sandbox will run this, get exit_code 0
        "generated_code": "print('hello world')",
        "gateway_decision": None,
        "sandbox_exit_code": None,
        "sandbox_output": None,
        "error_message": None,
        "retry_count": 0,
        "status": "started"
    }
    
    final_state = await app.ainvoke(initial_state)
    assert final_state["status"] == "executed"
    assert final_state["generated_code"] is not None
    # exit code 0 means it ran successfully inside Docker
    assert final_state["sandbox_exit_code"] == 0

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
