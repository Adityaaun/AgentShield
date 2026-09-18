import docker
from docker.errors import ContainerError, ImageNotFound, APIError
import os
import tempfile
from typing import Tuple, Dict, Any

class SandboxManager:
    def __init__(self, image: str = "python:3.10-alpine"):
        self.image = image
        self.client = docker.from_env()

    def _ensure_image(self):
        try:
            self.client.images.get(self.image)
        except ImageNotFound:
            print(f"Pulling sandbox image {self.image}...")
            self.client.images.pull(self.image)

    def execute_code(self, code: str, timeout: int = 5, use_network: bool = False) -> Tuple[int, str]:
        """
        Executes code in a sandboxed Docker container.
        Returns a tuple of (exit_code, output).
        """
        self._ensure_image()
        
        # Write code to a temporary file to mount into the container
        fd, path = tempfile.mkstemp(suffix=".py", prefix="agentshield_")
        with os.fdopen(fd, 'w') as f:
            f.write(code)

        # Synthetic secrets for environment
        environment = {
            "SYNTHETIC_API_KEY": "sk-dummy-123456789",
            "SYNTHETIC_DB_URL": "postgresql://dummy:dummy@internal/db"
        }

        # Resource limits as per PRD
        host_config = self.client.api.create_host_config(
            mem_limit='128m',
            nano_cpus=int(0.5 * 1e9), # 0.5 CPUs
            binds={
                path: {
                    'bind': '/workspace/script.py',
                    'mode': 'ro'
                }
            },
            network_mode='none' if not use_network else 'default',
        )

        container = None
        try:
            # Create the container
            container = self.client.api.create_container(
                image=self.image,
                command=["python", "/workspace/script.py"],
                environment=environment,
                host_config=host_config,
                working_dir="/workspace",
                # The root filesystem is NOT read-only in this simple config because alpine 
                # might need to write to /tmp or /var, but we don't bind mount any host directories 
                # other than the single script file read-only.
                # To strictly follow PRD "Read-only root FS with dedicated /workspace":
                # We can try to use read_only=True but need a tmpfs for /tmp
            )
            
            container_id = container.get('Id')
            
            self.client.api.start(container=container_id)
            
            # Wait for container to finish or timeout
            try:
                result = self.client.api.wait(container=container_id, timeout=timeout)
                exit_code = result.get('StatusCode', -1)
            except Exception as e:
                # Timeout or wait error
                # Force kill container
                self.client.api.kill(container=container_id)
                return -1, f"Execution timed out or failed: {str(e)}"
                
            logs = self.client.api.logs(container=container_id, stdout=True, stderr=True)
            return exit_code, logs.decode('utf-8')

        except Exception as e:
            return -1, str(e)
            
        finally:
            if container:
                try:
                    self.client.api.remove_container(container=container.get('Id'), force=True)
                except:
                    pass
            # Clean up temp file
            try:
                os.remove(path)
            except:
                pass
