from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional
from .session import Base

class Evaluation(Base):
    __tablename__ = "evaluations"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class AttackScenario(Base):
    __tablename__ = "attack_scenarios"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    category: Mapped[str] = mapped_column(String(100))
    prompt: Mapped[str] = mapped_column(String)
    success_condition: Mapped[str] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class Experiment(Base):
    __tablename__ = "experiments"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    eval_id: Mapped[int] = mapped_column(ForeignKey("evaluations.id"))
    scenario_id: Mapped[int] = mapped_column(ForeignKey("attack_scenarios.id"))
    config_id: Mapped[str] = mapped_column(String(50)) # A, B, C, D
    status: Mapped[str] = mapped_column(String(50))

class ExperimentAttempt(Base):
    __tablename__ = "experiment_attempts"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    exp_id: Mapped[int] = mapped_column(ForeignKey("experiments.id"))
    retry_count: Mapped[int] = mapped_column(Integer, default=0)
    generated_code: Mapped[str] = mapped_column(String)

class GatewayDecision(Base):
    __tablename__ = "gateway_decisions"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    attempt_id: Mapped[int] = mapped_column(ForeignKey("experiment_attempts.id"))
    decision: Mapped[str] = mapped_column(String(50)) # ALLOW, BLOCK
    rule_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    reason: Mapped[Optional[str]] = mapped_column(String, nullable=True)

class SandboxExecution(Base):
    __tablename__ = "sandbox_executions"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    attempt_id: Mapped[int] = mapped_column(ForeignKey("experiment_attempts.id"))
    exit_code: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    duration_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

class Evidence(Base):
    __tablename__ = "evidences"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    exp_id: Mapped[int] = mapped_column(ForeignKey("experiments.id"))
    json_payload: Mapped[dict] = mapped_column(JSON)
    # The 7 outcome boolean states
    attempted: Mapped[bool] = mapped_column(Boolean, default=False)
    gateway_blocked: Mapped[bool] = mapped_column(Boolean, default=False)
    sandbox_reached: Mapped[bool] = mapped_column(Boolean, default=False)
    sandbox_contained: Mapped[bool] = mapped_column(Boolean, default=False)
    attack_successful: Mapped[bool] = mapped_column(Boolean, default=False)
    sandbox_escape: Mapped[bool] = mapped_column(Boolean, default=False)
    successful_data_exfiltration: Mapped[bool] = mapped_column(Boolean, default=False)

class Report(Base):
    __tablename__ = "reports"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    eval_id: Mapped[int] = mapped_column(ForeignKey("evaluations.id"))
    snapshot_metrics_json: Mapped[dict] = mapped_column(JSON)
