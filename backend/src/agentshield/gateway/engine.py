from .schema import GatewayDecisionResult
from .parser import parse_code
from .rules import SecurityASTVisitor

class PolicyEngine:
    def evaluate(self, code: str) -> GatewayDecisionResult:
        if not code or not code.strip():
            return GatewayDecisionResult(decision="ALLOW")

        tree, error = parse_code(code)
        
        if error:
            # We BLOCK syntax errors because they are invalid Python
            # and could be evasion attempts.
            return GatewayDecisionResult(
                decision="BLOCK",
                rule_id="RULE_SYNTAX_ERROR",
                reason=error
            )
            
        visitor = SecurityASTVisitor()
        visitor.visit(tree)
        
        if visitor.violations:
            # For Phase 2, we just return the first violation we find
            first_violation = visitor.violations[0]
            return GatewayDecisionResult(
                decision="BLOCK",
                rule_id=first_violation.rule_id,
                reason=f"{first_violation.reason} (Line {first_violation.line})"
            )
            
        return GatewayDecisionResult(decision="ALLOW")
