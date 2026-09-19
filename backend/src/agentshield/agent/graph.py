from typing import TypedDict, Optional
from langgraph.graph import StateGraph, START, END

# Define the State
class AgentState(TypedDict):
    execution_id: int
    config_id: str # 'A', 'B', 'C', 'D'
    generated_code: str
    gateway_decision: Optional[str] # 'ALLOW' or 'BLOCK'
    sandbox_exit_code: Optional[int]
    sandbox_output: Optional[str]
    threat_signals: Optional[dict]
    error_message: Optional[str]
    status: str

# Define Nodes
from agentshield.gateway.engine import PolicyEngine

def security_gateway_node(state: AgentState) -> AgentState:
    """Analyzes AST and blocks/allows code."""
    engine = PolicyEngine()
    code = state.get("generated_code", "")
    
    if not code:
        return {"gateway_decision": "ALLOW", "status": "gateway_checked"}
        
    result = engine.evaluate(code)
    
    return {
        "gateway_decision": result.decision,
        "error_message": result.reason if result.decision == "BLOCK" else None,
        "status": "gateway_checked"
    }

from agentshield.sandbox.manager import SandboxManager, SandboxSecurityConfig

def sandbox_execution_node(state: AgentState) -> AgentState:
    """Executes code in hardened Docker sandbox."""
    code = state.get("generated_code", "")
    if not code:
        return {"sandbox_exit_code": 0, "sandbox_output": "", "threat_signals": {}, "status": "executed"}
        
    config = SandboxSecurityConfig(
        network_disabled=True,
        drop_capabilities=True,
        read_only_fs=True,
        tmpfs_enabled=True,
        memory_limit='128m'
    )
    sandbox = SandboxManager()
    exit_code, output, threat_signals = sandbox.execute_code(code, security_config=config)
    
    return {
        "sandbox_exit_code": exit_code,
        "sandbox_output": output,
        "threat_signals": threat_signals,
        "status": "executed"
    }

def baseline_execution_node(state: AgentState) -> AgentState:
    """Executes code in Baseline sandbox (less protected but still isolated)."""
    code = state.get("generated_code", "")
    if not code:
        return {"sandbox_exit_code": 0, "sandbox_output": "", "threat_signals": {}, "status": "executed"}
        
    config = SandboxSecurityConfig(
        network_disabled=False, # Baseline allows network
        drop_capabilities=False,
        read_only_fs=False,
        tmpfs_enabled=False,
        memory_limit='512m'
    )
    sandbox = SandboxManager()
    exit_code, output, threat_signals = sandbox.execute_code(code, security_config=config)
    
    return {
        "sandbox_exit_code": exit_code,
        "sandbox_output": output,
        "threat_signals": threat_signals,
        "status": "executed"
    }

# Conditional Routing
def route_initial(state: AgentState) -> str:
    config = state["config_id"]
    if config in ("B", "D"): # Gateway enabled
        return "security_gateway"
    elif config == "C": # Sandbox only
        return "sandbox"
    else: # Config A (Baseline)
        return "baseline_execution"

def route_after_gateway(state: AgentState) -> str:
    if state["gateway_decision"] == "BLOCK":
        return END
    
    config = state["config_id"]
    if config == "D":
        return "sandbox"
    else:
        # Config B goes to baseline after gateway
        return "baseline_execution"

# Build the Graph
workflow = StateGraph(AgentState)

# Add nodes
workflow.add_node("security_gateway", security_gateway_node)
workflow.add_node("sandbox", sandbox_execution_node)
workflow.add_node("baseline_execution", baseline_execution_node)

# Add edges
workflow.add_conditional_edges(
    START,
    route_initial,
    {
        "security_gateway": "security_gateway",
        "sandbox": "sandbox",
        "baseline_execution": "baseline_execution"
    }
)

workflow.add_conditional_edges(
    "security_gateway",
    route_after_gateway,
    {
        "sandbox": "sandbox",
        "baseline_execution": "baseline_execution",
        END: END
    }
)

workflow.add_edge("sandbox", END)
workflow.add_edge("baseline_execution", END)

# Compile
app = workflow.compile()
