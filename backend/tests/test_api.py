import pytest
from httpx import AsyncClient, ASGITransport
from agentshield.api.main import app

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

from unittest.mock import patch

@pytest.mark.asyncio
@patch('agentshield.sandbox.manager.SandboxManager.execute_code', return_value=(0, "mock output"))
@patch('agentshield.sandbox.manager.SandboxManager.__init__', return_value=None)
async def test_create_evaluation(mock_init, mock_execute):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/evaluations")
    
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["status"] == "RUNNING"

@pytest.mark.asyncio
async def test_get_evaluation_not_found():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/evaluations/9999")
    
    assert response.status_code == 404
