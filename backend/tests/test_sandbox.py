import pytest
from agentshield.sandbox.manager import SandboxManager, SandboxSecurityConfig

def test_sandbox_read_only_fs():
    """Verify that writing to the root filesystem fails due to read_only=True."""
    code = "open('/root/hacked.txt', 'w').write('hacked')"
    config = SandboxSecurityConfig()
    manager = SandboxManager()
    
    exit_code, output, signals = manager.execute_code(code, security_config=config)
    
    # Python raises Permission denied (Errno 13) or Read-only file system (Errno 30)
    assert exit_code != 0
    assert "Permission denied" in output or "Read-only file system" in output

def test_sandbox_dropped_capabilities():
    """Verify that dropping capabilities prevents certain operations (like chroot/ping if they were installed).
    Since we can't easily install them in the fast test, we test that cap_drop is in effect by
    attempting an operation that requires privileges we dropped, like setting hostnames or raw sockets."""
    # A simple way to check capabilities is to see if we can use a raw socket (requires CAP_NET_RAW)
    code = '''
import socket
try:
    s = socket.socket(socket.AF_INET, socket.SOCK_RAW, getattr(socket, "IPPROTO_ICMP", 1))
    print("SUCCESS")
except Exception as e:
    print(str(e))
'''
    config = SandboxSecurityConfig(network_disabled=False) # Enable network to test cap specifically
    manager = SandboxManager()
    
    exit_code, output, signals = manager.execute_code(code, security_config=config)
    assert "Operation not permitted" in output or "SUCCESS" not in output

def test_sandbox_non_root_user():
    """Verify that the container runs as nobody (user ID 65534 in Alpine) and not root (0)."""
    code = "import os; print(f'USER_ID={os.getuid()}')"
    config = SandboxSecurityConfig()
    manager = SandboxManager()
    
    exit_code, output, signals = manager.execute_code(code, security_config=config)
    assert "USER_ID=65534" in output

def test_sandbox_network_disabled():
    """Verify that network operations fail when network is disabled."""
    code = "import urllib.request; urllib.request.urlopen('http://1.1.1.1', timeout=2)"
    config = SandboxSecurityConfig(network_disabled=True)
    manager = SandboxManager()
    
    exit_code, output, signals = manager.execute_code(code, security_config=config)
    assert exit_code != 0
    assert "Network is unreachable" in output or "Temporary failure in name resolution" in output or "Connection refused" in output or "urlopen error" in output

def test_sandbox_pids_limit():
    """Verify that fork bombs or creating too many processes is blocked."""
    # Note: the test shouldn't actually bomb our system, so we do a controlled fork up to 100
    # pids_limit is 50.
    code = '''
import os
import time
import sys

success_count = 0
for i in range(100):
    try:
        pid = os.fork()
        if pid == 0:
            time.sleep(2)
            sys.exit(0)
        else:
            success_count += 1
    except BlockingIOError:
        pass
    except OSError as e:
        print(f"OS_ERROR: {e}")
        break

print(f"FORKED: {success_count}")
'''
    config = SandboxSecurityConfig(pids_limit=20)
    manager = SandboxManager()
    
    exit_code, output, signals = manager.execute_code(code, security_config=config)
    
    # It should fail before reaching 100
    assert "FORKED: 100" not in output
    assert "FORKED:" in output
    
    # We can also verify that a smaller number of forks succeeded
    import re
    match = re.search(r'FORKED:\s*(\d+)', output)
    if match:
        forks = int(match.group(1))
        assert forks < 100

def test_baseline_sandbox():
    """Verify that Config A (Baseline) Sandbox doesn't enforce these limits."""
    # Baseline shouldn't run as nobody, so it runs as root (0)
    code = "import os; print(f'USER_ID={os.getuid()}')"
    config = SandboxSecurityConfig(
        network_disabled=False,
        drop_capabilities=False,
        read_only_fs=False,
        tmpfs_enabled=False,
        run_as_nobody=False, # Root
        no_new_privileges=False
    )
    manager = SandboxManager()
    exit_code, output, signals = manager.execute_code(code, security_config=config)
    
    assert "USER_ID=0" in output
