import ast
from typing import Optional, Tuple

def parse_code(code: str) -> Tuple[Optional[ast.AST], Optional[str]]:
    """
    Parses source code into an AST.
    Returns (AST, None) if successful, or (None, error_message) if parsing fails.
    """
    try:
        tree = ast.parse(code)
        return tree, None
    except SyntaxError as e:
        return None, f"Syntax error at line {e.lineno}: {e.msg}"
    except Exception as e:
        return None, f"Parsing error: {str(e)}"
