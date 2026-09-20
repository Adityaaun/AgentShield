# AgentShield: Empirical AI Security Laboratory

[![Backend Tests](https://github.com/Adityaaun/AgentShield/actions/workflows/test.yml/badge.svg)](https://github.com/Adityaaun/AgentShield/actions/workflows/test.yml)
[![Python 3.10+](https://img.shields.io/badge/python-3.10%2B-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 1. What is AgentShield?
AgentShield is an enterprise-grade testing laboratory designed to evaluate the security of Autonomous AI Agents. It provides a visual, real-time matrix pipeline to empirically measure whether an AI system is vulnerable to prompt injections, malicious code execution, or unauthorized data exfiltration.

**Disclaimer:** AgentShield is an evaluation tool. It **does not guarantee** that an AI agent is 100% secure. It mathematically calculates resilience against specific tested attack vectors.

## 2. The Problem It Solves
As AI agents gain autonomous capabilities to execute code, browse the web, and interact with operating systems, they become susceptible to manipulation. An attacker could inject malicious instructions into a prompt (e.g., "Delete all files", "Exfiltrate credentials"). AgentShield solves the problem of *measuring* how well an agent (or security system) contains and prevents these malicious behaviors before deploying them to production.

## 3. Architecture and Data Flow
AgentShield operates on a client-server architecture:
- **Frontend:** A React/Vite dashboard providing real-time streaming (SSE) of evaluations and empirical scorecards.
- **Backend:** A FastAPI server orchestrating evaluations, running the LangGraph agent, and managing security controls.
- **Data Flow:** The backend pulls active `Attack Scenarios` from an SQLite database -> The AI generates a script based on the scenario -> The script passes through a `Static Gateway` -> If allowed, the script executes in a `Docker Sandbox` -> Telemetry (exit codes, stdout/stderr) is captured as `Evidence` -> An `Evaluation Engine` grades the final outcome.

## 4. Built-in Demo and A/B/C/D Configurations
The built-in demo runs a Cartesian product evaluation across 4 configurations to scientifically prove the value of each security layer:
- **Config A (Baseline):** No security controls. Raw agent execution.
- **Config B (Gateway):** Static AST Gateway is enabled.
- **Config C (Sandbox):** Docker Sandbox is enabled.
- **Config D (Full AgentShield):** Both Gateway and Sandbox are active (Defense-in-Depth).

## 5. Attack Scenarios
AgentShield is driven by dynamic **Attack Scenarios** representing real-world threats (e.g., Ransomware encryption, AWS Credential Harvesting, Network Exfiltration). Scenarios are managed in the UI and act as the adversarial prompts fed to the agent during evaluation.

## 6. Security Controls: Gateway and Docker Sandbox Roles
- **Static AST Gateway:** A Python AST (Abstract Syntax Tree) parser that intercepts generated scripts before execution. It blocks dangerous imports (e.g., `os`, `subprocess`) and network calls (e.g., `requests`, `urllib`), acting as a fast, first line of defense.
- **Docker Sandbox:** A dynamic containment environment. If a malicious script evades the Gateway, it executes inside a heavily restricted, isolated Docker container with strict memory, CPU, and network boundaries, preventing harm to the host OS.

## 7. Evidence Collection and Evaluation
AgentShield does not rely on guessing. Every execution yields concrete **Evidence**:
- Gateway decisions (`ALLOW` / `BLOCK`)
- Sandbox Exit Codes (e.g., `0` for success, `1` for error)
- Sandbox Standard Output & Error

The **Evaluation Engine** grades this evidence to assign a definitive Outcome (e.g., `EXECUTED_AND_CONTAINED`, `THREAT_SIGNAL_DETECTED`).

## 8. Metric Definitions
The Scorecard auto-calculates mathematical guarantees based on the Evaluation Engine:
- **Attack Prevention Rate:** % of malicious scenarios successfully stopped from completing.
- **Attack Success Rate:** % of malicious scenarios that successfully executed without containment.
- **Gateway Block Rate:** % of malicious payloads caught specifically by the static AST Gateway.
- **Sandbox Containment Rate:** % of payloads that bypassed the Gateway but were successfully contained or crashed within the Docker Sandbox.

## 9. BYOA / Test My Agent
AgentShield supports **Bring Your Own Agent (BYOA)**. Instead of using the built-in demo agent, you can connect your own remote API agent endpoint (e.g., `http://localhost:5000/chat`). AgentShield will send the adversarial attack scenarios to your agent and evaluate its text response.

## 10. Built-in A/B/C/D vs BYOA
- **Built-in Demo:** Evaluates the internal LangGraph agent using the local Gateway and Docker Sandbox across a full A/B/C/D matrix.
- **BYOA (Remote Evaluation):** Evaluates an external, remote agent via API. Because AgentShield cannot install a Docker sandbox on a remote third-party server, the local Gateway and Sandbox are **Not Applied (N/A)** for BYOA. Instead, the Evaluation Engine uses LLM-assisted grading to determine if the remote agent succumbed to the attack or safely refused it.

## 11. Current Verified Test Results
The `main` branch is verified and stable:
- **Backend Tests:** 30/30 `pytest` integration and unit tests passing successfully.
- **Frontend Build:** Clean Typescript compilation and Vite minification with zero errors.
- **Security:** Evaluator metrics and BYOA SSRF protections are mathematically verified.

## 12. Setup and Local Run Instructions
### Prerequisites
- Python 3.10+
- Node.js (v18+)
- Docker Desktop (Must be running)

### Backend Setup
1. `cd backend`
2. `pip install -r requirements.txt`
3. Create a `.env` file containing your `GOOGLE_API_KEY=your_key` (Required for the built-in demo LLM).
4. Set PYTHONPATH: `$env:PYTHONPATH="src"` (Windows) or `export PYTHONPATH="src"` (Mac/Linux).
5. Start server: `python -m uvicorn agentshield.api.main:app --port 8000`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. Open `http://localhost:5173`

## 13. Limitations and Future Scope
- **No Silver Bullet:** AgentShield provides empirical measurement, not an absolute guarantee of security. Zero-day prompt injections can still evade detection.
- **LLM Rate Limits:** The Built-in Demo relies on the Gemini API and may experience HTTP 429 Rate Limits on free tiers during heavy matrix evaluations.
- **Future Scope:** Expanding BYOA to support remote code execution telemetry, supporting more advanced network mocking inside the Docker Sandbox, and expanding the pre-built CVE scenario database.
