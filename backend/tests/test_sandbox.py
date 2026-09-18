import pytest
import docker
from agentshield.sandbox.manager import SandboxManager

def is_docker_running():
    try:
        docker.from_env().ping()
        return True
    except Exception:
        return False

pytestmark = pytest.mark.skipif(not is_docker_running(), reason="Docker daemon is not running")

@pytest.fixture
def sandbox():
    return SandboxManager()

def test_sandbox_execution_success(sandbox):
    code = "print('hello from sandbox')"
    exit_code, output = sandbox.execute_code(code)
    assert exit_code == 0
    assert "hello from sandbox" in output

def test_sandbox_synthetic_secret(sandbox):
    code = "import os; print(os.environ.get('SYNTHETIC_API_KEY'))"
    exit_code, output = sandbox.execute_code(code)
    assert exit_code == 0
    assert "sk-dummy-123456789" in output

def test_sandbox_network_isolation(sandbox):
    code = "import urllib.request; urllib.request.urlopen('http://example.com')"
    exit_code, output = sandbox.execute_code(code, timeout=10)
    # The network is disabled, so urllib should fail to resolve or timeout
    assert exit_code != 0
    
def test_sandbox_timeout(sandbox):
    # This will sleep for 10 seconds, but our timeout is 2
    code = "import time; time.sleep(10)"
    exit_code, output = sandbox.execute_code(code, timeout=2)
    assert exit_code == -1
    assert "timed out" in output.lower()
