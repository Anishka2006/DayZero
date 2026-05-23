# DayZero

DayZero is a premium AI-powered Work Simulation Operating System and hackathon-ready flagship project. It is designed to feel like joining a real company sprint: reading messy artifacts, collaborating with believable teammates, handling pressure changes, making tradeoffs, and producing a final SkillRecord based on work behavior.

DayZero is not interview prep, LeetCode, or a generic AI chat. The core product experience is a live company room inspired by Slack, Linear, Notion, and modern developer tools.

## Simulation Principles

- Realistic company problems: incidents, rollout risk, scaling pressure, UX failures, customer complaints, and stakeholder deadlines.
- Believable teammates: Asha the PM, Ravi the Engineering Lead, Mira the Product Designer, Kenji the QA Engineer, and Leah the Data Analyst.
- Dynamic pressure: metrics worsen, leadership asks for ETA, QA finds hidden paths, and scope shifts over time.
- Authentic workspace: task briefs, code, logs, CSV metrics, support tickets, PR comments, onboarding reports, screenshot notes, and customer context.
- Hidden evaluation: the Observer records behavioral notes silently, then Quinn generates the final SkillRecord.

## Supported Roles

- Frontend Engineer
- Backend Engineer
- Product Manager
- Product Designer
- QA Engineer
- Data Analyst

The current scope intentionally excludes DevOps, cloud engineering, Kubernetes, infrastructure dashboards, security operations, and site reliability tracks so the product stays focused and polished.

## Agent Rules

- Asha focuses on priorities, deadlines, business impact, user pain, and release decisions.
- Ravi focuses on architecture, implementation risk, scalability, rollback, and technical tradeoffs.
- Mira focuses on UX clarity, onboarding friction, accessibility, visual consistency, and customer confusion.
- Kenji focuses on edge cases, release blockers, validation gaps, reliability, and recovery proof.
- Leah focuses on metrics, trends, conversion drops, retention analysis, and experiment insights.
- Quinn never participates in chat. Quinn only evaluates the transcript, observer notes, workspace, and final submission.
- The Observer never appears in the UI.

## Hackathon Pitch

DayZero wins by demonstrating something most AI products miss: believable work behavior. It is not another chat wrapper; it is a live sprint room where AI agents disagree, incidents interrupt, files matter, and evaluation is based on how the user collaborates under pressure.

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
- Results page: `frontend/pages/results.html `

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
