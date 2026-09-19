import enum
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, Boolean, JSON, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional
from .session import Base

class ExperimentOutcome(str, enum.Enum):
    BLOCKED_BY_GATEWAY = "BLOCKED_BY_GATEWAY"
    EXECUTED_BASELINE = "EXECUTED_BASELINE"
    EXECUTED_AND_CONTAINED = "EXECUTED_AND_CONTAINED"
    ATTACK_SUCCEEDED = "ATTACK_SUCCEEDED"
    THREAT_SIGNAL_DETECTED = "THREAT_SIGNAL_DETECTED"
    DATA_EXFILTRATION_ATTEMPT = "DATA_EXFILTRATION_ATTEMPT"
    DATA_EXFILTRATION_SUCCESS = "DATA_EXFILTRATION_SUCCESS"
    TIMEOUT = "TIMEOUT"
    INFRASTRUCTURE_FAILURE = "INFRASTRUCTURE_FAILURE"
    EXECUTION_ERROR = "EXECUTION_ERROR"
    INVALID_ARTIFACT = "INVALID_ARTIFACT"

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
    evaluator_config: Mapped[dict] = mapped_column(JSON) # Structured evaluator JSON
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class ScenarioRun(Base):
    """Represents the evaluation of a specific scenario within an Evaluation."""
    __tablename__ = "scenario_runs"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    eval_id: Mapped[int] = mapped_column(ForeignKey("evaluations.id"))
    scenario_id: Mapped[int] = mapped_column(ForeignKey("attack_scenarios.id"))
    status: Mapped[str] = mapped_column(String(50))

class Attempt(Base):
    """The single LLM generation for a ScenarioRun."""
    __tablename__ = "attempts"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    scenario_run_id: Mapped[int] = mapped_column(ForeignKey("scenario_runs.id"))
    retry_count: Mapped[int] = mapped_column(Integer, default=0)
    generated_code: Mapped[str] = mapped_column(String)
    artifact_sha256: Mapped[str] = mapped_column(String(64))
    is_valid: Mapped[bool] = mapped_column(Boolean, default=True)
    validation_reason: Mapped[Optional[str]] = mapped_column(String, nullable=True)

class ExecutionRun(Base):
    """Execution of an Attempt under a specific Config."""
    __tablename__ = "execution_runs"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    attempt_id: Mapped[int] = mapped_column(ForeignKey("attempts.id"))
    config_id: Mapped[str] = mapped_column(String(50)) # A, B, C, D
    duration_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    primary_outcome: Mapped[Optional[ExperimentOutcome]] = mapped_column(Enum(ExperimentOutcome), nullable=True)

class GatewayDecision(Base):
    __tablename__ = "gateway_decisions"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    execution_id: Mapped[int] = mapped_column(ForeignKey("execution_runs.id"))
    decision: Mapped[str] = mapped_column(String(50)) # ALLOW, BLOCK
    rule_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    reason: Mapped[Optional[str]] = mapped_column(String, nullable=True)

class SandboxExecution(Base):
    __tablename__ = "sandbox_executions"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    execution_id: Mapped[int] = mapped_column(ForeignKey("execution_runs.id"))
    exit_code: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    threat_signals: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    stdout: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    stderr: Mapped[Optional[str]] = mapped_column(String, nullable=True)

class Evidence(Base):
    __tablename__ = "evidences"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    execution_id: Mapped[int] = mapped_column(ForeignKey("execution_runs.id"))
    json_payload: Mapped[dict] = mapped_column(JSON) # Raw detailed telemetry

class Report(Base):
    __tablename__ = "reports"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    eval_id: Mapped[int] = mapped_column(ForeignKey("evaluations.id"))
    snapshot_metrics_json: Mapped[dict] = mapped_column(JSON)
