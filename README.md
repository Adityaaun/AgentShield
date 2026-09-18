# AgentShield: Empirical AI Security Laboratory

[![Backend Tests](https://github.com/Adityaaun/AgentShield/actions/workflows/test.yml/badge.svg)](https://github.com/Adityaaun/AgentShield/actions/workflows/test.yml)
[![Python 3.10+](https://img.shields.io/badge/python-3.10%2B-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **🎥 Demo:** *(Add your screen recording GIF here — use [ScreenToGif](https://www.screentogif.com/) on Windows, free & easy)*

AgentShield is an enterprise-grade testing laboratory designed to evaluate the security of Autonomous AI Agents.
 It provides a visual, real-time matrix pipeline to prove whether an AI system is vulnerable to prompt injections, malicious code execution, or unauthorized data exfiltration.

It achieves this through a **Defense-in-Depth** architecture:
1. **Static AST Gateway:** Parses generated Python/Bash scripts and blocks malicious imports or system calls before execution.
2. **Docker Sandbox:** Executes the AI's code in a heavily restricted, isolated container to contain zero-day behaviors.

## Screenshots

![Overview Dashboard](docs/assets/overview.png)
*The main overview dashboard where you can launch the matrix pipeline.*

![Live Operations](docs/assets/live_operations.png)
*Live terminal stream watching the LangGraph agent and sandbox defenses in real-time.*

![Security Scorecard](docs/assets/scorecard.png)
*Detailed empirical scorecard breaking down defense mechanisms and generated attack payloads.*

![A/B Comparison Mode](docs/assets/compare_scorecard.png)
*Side-by-side A/B comparison to track defense improvements between evaluations.*

![Scenarios Management](docs/assets/scenarios.png)
*Threat scenario management with CVE imports.*

![Evaluation History](docs/assets/history.png)
*Pipeline execution history and timeline tracking.*

## 🌟 Key Features

- **Premium Operations Dashboard:** A stunning, dark-mode React interface inspired by modern security operations centers.
- **Matrix Evaluation Pipeline:** Runs a full cartesian product of test scenarios across 4 different defense configurations (Baseline, Gateway, Sandbox, Full Defense) in real-time.
- **Split-Screen Live Operations:** Watch the pipeline execute via Server-Sent Events (SSE) in a live terminal side-by-side with your configurations.
- **Dynamic Scenario Management:** Add, remove, and toggle active/inactive real-world attack prompts (e.g., AWS Credential Harvesting, Reverse Shells, Ransomware).
- **Graceful Error Handling:** Built-in timeouts and error catching to handle LLM API Rate Limits and infinite retry loops without crashing the UI.
- **Security Scorecard:** Auto-calculates mathematical guarantees of safety (Prevention Rate, Containment Rate, Attack Success).

---

## 1. Setup Instructions

Before starting, ensure you have **Python 3.10+**, **Node.js (v18+)**, and **Docker Desktop** installed.

### Backend Setup (FastAPI & LangGraph)

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Activate your virtual environment and install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up your environment variables by creating a `.env` file (you can copy `.env.example`):
   ```ini
   # Add your AI Provider key here (Google Gemini, OpenAI, etc.)
   GOOGLE_API_KEY=your_api_key_here
   ```
   *Note: AgentShield defaults to a local SQLite database (`agentshield.db`) for easy setup.*

4. Set the `PYTHONPATH` so Python can find the package:
   ```bash
   # Windows PowerShell
   $env:PYTHONPATH="src"
   # Mac/Linux
   export PYTHONPATH="src"
   ```
5. Start the server using Uvicorn:
   ```bash
   uvicorn agentshield.api.main:app --reload --port 8000
   ```

### Frontend Setup (React + Vite + Tailwind)

1. Open a **new** terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

---

## 2. Using the Platform

1. **Configure Scenarios:** Navigate to the **Scenarios** tab. By default, it is pre-populated with highly realistic threats (Ransomware, Cryptominers). You can add your own or toggle specific ones on/off to control the pipeline.
2. **Run the Matrix:** Go to the **Overview** tab and click **Run Matrix Pipeline**. 
3. **Live Operations:** The screen will dynamically split, opening the Live Operations terminal. You can watch the LangGraph agent generate code and see real-time decisions from the Gateway and Sandbox.
4. **View Results:** Once the evaluation completes (or if it gracefully aborts due to an API limit), click **View Scorecard** to see your updated empirical security metrics.

---

## 3. Security Notice

**DO NOT** push your `.env` file to public repositories. AgentShield is configured to ignore `.env` files by default to protect your API keys.

*Disclaimer: This tool is intended for defensive security research and empirical testing of autonomous agents.*
