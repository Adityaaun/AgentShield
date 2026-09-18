import asyncio
import os
from agentshield.db.session import engine, Base
from agentshield.db.models import *

async def init_models():
    print("Creating database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("Done!")

if __name__ == "__main__":
    asyncio.run(init_models())
