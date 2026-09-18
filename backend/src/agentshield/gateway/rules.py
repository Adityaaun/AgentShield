import ast
from typing import List, Tuple

class SecurityViolation:
    def __init__(self, rule_id: str, reason: str, line: int):
        self.rule_id = rule_id
        self.reason = reason
        self.line = line

class SecurityASTVisitor(ast.NodeVisitor):
    def __init__(self):
        self.violations: List[SecurityViolation] = []
        
        self.banned_imports = {
            "os", "sys", "subprocess", "socket", "urllib", "requests", 
            "http", "ftplib", "pty", "shlex", "shutil", "builtins"
        }
        
        self.banned_calls = {
            "eval", "exec", "compile", "__import__", "open", "input"
        }

    def visit_Import(self, node: ast.Import):
        for alias in node.names:
            base_module = alias.name.split('.')[0]
            if base_module in self.banned_imports:
                self.violations.append(
                    SecurityViolation(
                        rule_id="RULE_BANNED_IMPORT",
                        reason=f"Import of banned module '{alias.name}' detected.",
                        line=node.lineno
                    )
                )
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom):
        if node.module:
            base_module = node.module.split('.')[0]
            if base_module in self.banned_imports:
                self.violations.append(
                    SecurityViolation(
                        rule_id="RULE_BANNED_IMPORT",
                        reason=f"Import from banned module '{node.module}' detected.",
                        line=node.lineno
                    )
                )
        self.generic_visit(node)

    def visit_Call(self, node: ast.Call):
        if isinstance(node.func, ast.Name):
            if node.func.id in self.banned_calls:
                self.violations.append(
                    SecurityViolation(
                        rule_id="RULE_BANNED_CALL",
                        reason=f"Call to banned function '{node.func.id}' detected.",
                        line=node.lineno
                    )
                )
        # Also catch getattr/attribute calls like os.system if os was aliased or imported differently
        elif isinstance(node.func, ast.Attribute):
            if isinstance(node.func.value, ast.Name):
                if node.func.value.id == "os" and node.func.attr in ("system", "popen", "execv", "spawn"):
                    self.violations.append(
                        SecurityViolation(
                            rule_id="RULE_OS_EXEC",
                            reason=f"Call to os.{node.func.attr} detected.",
                            line=node.lineno
                        )
                    )
        self.generic_visit(node)

    def visit_Attribute(self, node: ast.Attribute):
        if isinstance(node.value, ast.Name) and node.value.id == "os" and node.attr == "environ":
            self.violations.append(
                SecurityViolation(
                    rule_id="RULE_OS_ENVIRON",
                    reason="Access to os.environ detected.",
                    line=node.lineno
                )
            )
        self.generic_visit(node)
