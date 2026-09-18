import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
import dotenv

dotenv.load_dotenv()

# We need the async driver for postgresql
# Fallback to sqlite if no DATABASE_URL is provided, for easier local testing/setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./agentshield.db")

# If using postgresql, ensure we use asyncpg driver
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
