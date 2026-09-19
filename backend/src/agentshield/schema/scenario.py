from pydantic import BaseModel
from typing import Optional, List

class AttackScenarioSchema(BaseModel):
    category: str
    prompt: str
    success_condition: str
    
class EvidenceSchema(BaseModel):
    attempted: bool = False
    gateway_blocked: bool = False
    sandbox_reached: bool = False
    sandbox_contained: bool = False
    attack_successful: bool = False
    threat_signal_detected: bool = False
    successful_data_exfiltration: bool = False
    
class AgentConfig(BaseModel):
    config_id: str # 'A', 'B', 'C', 'D'
