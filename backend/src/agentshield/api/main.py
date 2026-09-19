from fastapi import FastAPI
# Trigger reload 3
from fastapi.middleware.cors import CORSMiddleware
from agentshield.api.routes import router

app = FastAPI(title="AgentShield API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For phase 5/6 local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/health")
async def health_check():
    return {"status": "ok"}
