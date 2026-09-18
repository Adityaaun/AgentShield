from typing import Optional
from pydantic import BaseModel

class GatewayDecisionResult(BaseModel):
    decision: str  # 'ALLOW' or 'BLOCK'
    rule_id: Optional[str] = None
    reason: Optional[str] = None
