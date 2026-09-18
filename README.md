# AgentShield - Local Development Guide

This guide provides step-by-step instructions on how to run and test the AgentShield Empirical LLM Agent Security Evaluation Platform on your local machine.

## Prerequisites

Before starting, ensure you have the following installed:
1. **Python 3.10+**
2. **Node.js (v18+)** and npm
3. **Docker Desktop** (must be running in the background for Sandbox tests)
4. **PostgreSQL** (running locally on port 5432)

---

## 1. Setup the Database

1. Open your PostgreSQL command line (or pgAdmin).
2. Create a database named `agentshield`:
   ```sql
   CREATE DATABASE agentshield;
   ```
3. Update the `backend/.env` file if your Postgres credentials differ from the default:
   ```ini
   DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost/agentshield
   ```

---

## 2. Run the Backend (FastAPI)

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Activate your virtual environment (if not already activated):
   ```bash
   # Windows
   .\venv\Scripts\Activate.ps1
   # Mac/Linux
   source venv/bin/activate
   ```
3. Ensure dependencies are installed (they should be already, but just in case):
   ```bash
   pip install -r requirements.txt
   ```
4. Set the `PYTHONPATH` so Python can find the `agentshield` package:
   ```bash
   # Windows PowerShell
   $env:PYTHONPATH="src"
   # Mac/Linux
   export PYTHONPATH="src"
   ```
5. Start the FastAPI server using Uvicorn:
   ```bash
   uvicorn agentshield.api.main:app --reload --port 8000
   ```
   *The backend will now be running at http://localhost:8000.*

---

## 3. Run the Frontend (React + Vite)

1. Open a **new** terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Ensure dependencies are installed:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will now be running at http://localhost:5173.*

---

## 4. How to Test the Project Manually

1. **Open the Dashboard:** Open your web browser and go to `http://localhost:5173`.
2. **Start the Evaluation Matrix:** On the Overview page, click the **"Run Matrix Pipeline"** button. This sends a request to the backend to start a matrix run across all configurations (A, B, C, D).
3. **Watch the Live Stream:** You will automatically be redirected to the **Live Evaluation** tab. Watch the terminal logs stream in real-time via Server-Sent Events (SSE) as the LangGraph agent generates code and the Security Gateway and Docker Sandbox evaluate it.
4. **View the Scorecard:** Once the matrix is finished (or even while it is running), click on the **Security Scorecard** tab in the sidebar. 
5. **Refresh Metrics:** Ensure the input box says `1` (or your current Evaluation ID) and click **"Refresh"**. You will see the dynamically calculated metrics (Attack Success Rate, Prevention Rate, Gateway Block Rate, Sandbox Containment) updated based on the rigorous evidence classifications.

---

## 5. Running Automated Tests (Backend)

If you want to run the python unit tests manually to ensure the underlying logic works:

1. In the `backend` terminal (with the virtual environment activated and `PYTHONPATH` set), run:
   ```bash
   pytest tests/
   ```
2. Note: The `test_sandbox.py` tests will automatically be skipped if Docker Desktop is not currently running. To test the sandbox, ensure Docker Desktop is started before running the tests.
