# DayZero

DayZero is an AI-powered work simulation platform built around realistic hiring tasks, role-based dashboards, and AI-driven evaluation.

## Current Structure

This repo now follows your hybrid structure:

- `index.html`, `main.css`, and `app.js` stay at the root
- `backend/app.py` and `backend/auth.py` stay where they are
- the remaining frontend, AI-engine, service, and test files are organized into target-style folders

```text
DayZero/
├── frontend/
│   ├── css/
│   │   └── dashboard.css
│   ├── js/
│   │   ├── dashboard.js
│   │   └── recruiter_app.js
│   ├── pages/
│   │   ├── dashboard.html
│   │   ├── recruiter_dashboard.html
│   │   ├── results.html
│   │   └── roles.html
│   └── index.html
├── backend/
│   ├── services/
│   │   └── orchestrator.py
│   ├── app.py
│   ├── auth.py
│   └── requirements.txt
├── ai_engine/
│   ├── agents/
│   ├── config/
│   │   └── config.py
│   ├── core/
│   │   ├── gemini_client.py
│   │   ├── llm.py
│   │   └── prompts.py
│   └── __init__.py
├── db/
│   └── schema.sql
├── tests/
│   └── test.py
├── .gitignore
├── README.md
├── app.js
├── index.html
├── main.css
└── requirements.txt
```
## Entry Points

- Landing page: `index.html`
- Candidate role selection: `frontend/pages/roles.html`
- Candidate dashboard: `frontend/pages/dashboard.html`
- Recruiter dashboard: `frontend/pages/recruiter_dashboard.html`
- Results page: `frontend/pages/results.html`

## Backend

- `backend/app.py`: main Flask API
- `backend/auth.py`: authentication/profile service
- `backend/services/orchestrator.py`: prototype orchestration flow

## Setup

Install backend dependencies:

```bash
pip install -r backend/requirements.txt
```

Install root dependencies for the AI prototype scripts if needed:

```bash
pip install -r requirements.txt
```

## Run Locally

Backend API:

```bash
python backend/app.py
```

Auth service:

```bash
python backend/auth.py
```

Frontend:

- `index.html`
- `frontend/pages/roles.html`
- `frontend/pages/recruiter_dashboard.html`
