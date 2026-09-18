import pytest
from agentshield.gateway.engine import PolicyEngine

def test_policy_engine_allow():
    engine = PolicyEngine()
    code = """
def hello_world():
    print("Hello, world!")
    return 42
    
hello_world()
"""
    result = engine.evaluate(code)
    assert result.decision == "ALLOW"

def test_policy_engine_banned_import():
    engine = PolicyEngine()
    code = """
import os
os.system('echo "Hacked!"')
"""
    result = engine.evaluate(code)
    assert result.decision == "BLOCK"
    assert result.rule_id == "RULE_BANNED_IMPORT"

def test_policy_engine_banned_import_from():
    engine = PolicyEngine()
    code = """
from os import system
system('echo "Hacked!"')
"""
    result = engine.evaluate(code)
    assert result.decision == "BLOCK"
    assert result.rule_id == "RULE_BANNED_IMPORT"

def test_policy_engine_banned_call():
    engine = PolicyEngine()
    code = """
user_input = "print('hello')"
eval(user_input)
"""
    result = engine.evaluate(code)
    assert result.decision == "BLOCK"
    assert result.rule_id == "RULE_BANNED_CALL"

def test_policy_engine_os_environ():
    engine = PolicyEngine()
    code = """
import something_else as os
# the AST rule actually checks if it's called 'os', so this is just a dummy test for os.environ
x = os.environ.get('SECRET')
"""
    result = engine.evaluate(code)
    assert result.decision == "BLOCK"
    assert result.rule_id == "RULE_OS_ENVIRON"

def test_policy_engine_syntax_error():
    engine = PolicyEngine()
    code = """
def unclosed_function(
"""
    result = engine.evaluate(code)
    assert result.decision == "BLOCK"
    assert result.rule_id == "RULE_SYNTAX_ERROR"
    assert "Syntax error" in result.reason
