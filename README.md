# 🌌 DayZero: AI-Powered Work Simulation Platform

[![DayZero Logo](https://img.shields.io/badge/DayZero-Work%20Simulation%20OS-6366f1?style=for-the-badge&logo=visual-studio-code&logoColor=white)](https://github.com/Anishka2006/DayZero)
[![Tech Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20JS%20%7C%20Flask%20%7C%20MongoDB-0ea5e9?style=for-the-badge&logo=mongodb&logoColor=white)](https://github.com/Anishka2006/DayZero)
[![AI Engine](https://img.shields.io/badge/AI-Gemini%20Flash-ef4444?style=for-the-badge&logo=google-gemini&logoColor=white)](https://github.com/Anishka2006/DayZero)
[![Auth](https://img.shields.io/badge/Auth-JWT%20%26%20Domain%20Verification-10b981?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://github.com/Anishka2006/DayZero)

DayZero is a premium, investor-ready, and recruiter-friendly **AI-Powered Work Simulation Platform** that bridges the gap between academic learning and industry expectations. Instead of relying on static resumes or generic multiple-choice questions (MCQs), DayZero introduces candidates to a live, high-fidelity corporate room environment (inspired by Slack, Notion, and Linear) where they tackle real-world engineering, design, and product sprints alongside interactive AI teammates under dynamic workplace pressure.

---

## 📌 Problem Statement

Traditional recruitment and talent assessment systems are fundamentally broken:
- **Credential Inflation:** Resumes contain exaggerated achievements and keyword-stuffed bullet points, failing to reflect a candidate's actual on-the-job execution.
- **Outdated Assessments:** Standard multiple-choice questions (MCQs) and algorithmic puzzles (like LeetCode) assess memorization instead of pragmatic problem-solving, collaboration, or trade-off evaluation.
- **Resume Bias & Exclusivity:** Talented individuals from non-traditional backgrounds are frequently filtered out by automated ATS keywords before showing their skills.
- **Recruitment Bottlenecks:** Engineering managers spend hours reviewing manual take-home tasks, creating a massive time drain on high-value staff.

---

## 💡 The Solution

DayZero replaces resume screening with a **realistic work simulation engine** that mirrors a software engineer's "Day Zero" on the job.

```
┌─────────────────┐       ┌───────────────────────────┐       ┌──────────────────┐
│ Candidate Enters│ ───►  │ AI-Powered Work Simulation│ ───►  │ Quinn Evaluator  │
│ Landing & Roles │       │ Slack/Linear-style Sprint │       │Generates Verified│
└─────────────────┘       └───────────────────────────┘       │   SkillRecord    │
                                                              └──────────────────┘
```

By dropshipping candidates into a fast-paced sprint channel with interactive, domain-specific AI teammates, DayZero evaluates **how** candidates work, collaborate, and make trade-offs under real pressure. 
At the end of the sprint, the platform generates a verified, high-fidelity **SkillRecord** containing qualitative insights, quantitative skill scores (Leadership, Communication, Execution, Adaptability, Problem-Solving), and a direct shortlist recommendation for recruiters.

---

## ⚡ Key Features

| Feature | Description | Business/Recruiter Value |
| :--- | :--- | :--- |
| 🤖 **AI Work Simulations** | Generates real-world corporate incident rooms with files, briefs, and codebases loaded dynamically. | Tests practical problem-solving in a sandboxed, low-risk setup. |
| 👥 **Believable AI Teammates** | Domain-specific agents (PM, Tech Lead, Designer, QA, Data Analyst) interact, challenge, and collaborate with candidates. | Evaluates soft skills, remote communication, and team alignment. |
| 📊 **Quinn AI Evaluator & Observer** | An invisible observer monitors behavioral signals and prompts Quinn to generate a detailed **SkillRecord** post-simulation. | Delivers bias-free, deep-dive evaluation without manual reviewer overhead. |
| 💼 **Recruiter Dashboard** | Rich dashboards detailing candidate progress, scores, top skills, shortlist status, and project submissions. | Reduces time-to-hire by highlighting top 5% candidates instantly. |
| 🔑 **Domain Verification** | Domain-based authentication blocks personal providers (Gmail/Yahoo) to enforce recruiter signup. | Secures company assets and workspaces for enterprise tenants. |
| 📱 **Responsive Workspace UI** | Styled with custom dark/light theme options, responsive sidebars, interactive messaging, and code-editor capabilities. | Delivers an outstanding, professional candidate experience. |

---

## 👤 User Roles & Agent Personalities

### 1. User Roles

#### 🎓 Student & Job Seeker (Candidate)
- **Role Selection:** Browse and select specific roles (Frontend, Backend, PM, Product Designer, QA, Data Analyst).
- **Workspace Access:** Read task briefs, examine code file buffers, view support tickets, metrics, and logs.
- **Sprint Participation:** Collaborate with AI teammates, make trade-offs, handle crisis events, and submit solutions.
- **Verified Portfolio:** Share a high-impact SkillRecord containing quantitative performance metrics with potential employers.

#### 👔 Recruiter
- **Candidate Invitation:** Invite students/candidates via email to specific role-based simulations.
- **Insights & Shortlisting:** Access a detailed candidate directory showcasing scores, progress, top skills, and AI feedback.
- **Review and Share:** Inspect candidate code submissions, raw chat logs, and download verified SkillRecords.

#### 🏢 Company Admin
- **Custom Workflow Setup:** Create new project briefs and simulation parameters tailored to company products.
- **Domain Verification Settings:** Manage authorized recruiter domains and workspace members.
- **Hiring Integration:** Configure default role expectations, difficulty levels, and hiring pipelines.

---

### 2. The AI Sprint Teammates

To simulate a real engineering sprint, candidates collaborate with 5 core AI agents, each with unique professional priorities and communication styles:

```
               ┌───────────────────────────────────────────────────┐
               │              AI Sprint Teammates                  │
               ├─────────────────┬─────────────────────────────────┤
               │ 👩‍💼 Asha (PM)    │ Priorities, Deadlines, UX Pain  │
               │ 👨‍💻 Ravi (Lead)  │ Architecture, Risk, Rollbacks   │
               │ 🎨 Mira (UX)    │ Accessibility, User Friction    │
               │ 🕵️‍♂️ Kenji (QA)   │ Edge Cases, Release Blockers    │
               │ 📈 Leah (Data)  │ Conversion, SQL, Metrics        │
               └─────────────────┴─────────────────────────────────┘
```

- **👩‍💼 Asha (Product Manager):** Focuses on task priorities, customer-facing scope, business deadlines, user pain points, and release decisions.
- **👨‍💻 Ravi (Engineering Lead):** Focuses on system architecture, database scalability, technical rollback strategy, security parameters, and implementation risk.
- **🎨 Mira (Product Designer):** Focuses on user-experience clarity, onboarding friction, visual accessibility, consistency, and copy clarity.
- **🕵️‍♂️ Kenji (QA Engineer):** Focuses on functional edge cases, regression paths, release blockers, recovery proofs, and input validation gaps.
- **📈 Leah (Data Analyst):** Focuses on business metrics, conversion funnels, query bottlenecks, retention trends, and A/B test results.
- **🔍 Quinn (AI Evaluator):** Never participates in the sprint chat. At submission, Quinn evaluates the transcript, system logs, code edits, and behavior records to draft the final SkillRecord.
- **👁️ The Observer (System Agent):** Silently runs in the background. It measures metrics like speed-to-reply, adaptability to crisis triggers, and collaboration depth, feeding them directly into Quinn's evaluation engine.

---

## 🏗️ System Architecture

DayZero operates on a dual-engine architecture: a high-responsiveness frontend Client, a secure backend Core API, and a dedicated multi-agent LLM Orchestration Engine.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                  │
│   Landing Page  ──►  Candidate Setup  ──►  High-Fidelity Sprint Room   │
│  (HTML5/CSS3/JS)       (Roles Page)         (Slack/Notion UI Clones)   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ HTTPS Requests / JSON
┌──────────────────────────────────▼─────────────────────────────────────┐
│                           BACKEND PLATFORM                             │
│                  Flask / Python Microservice Core                      │
│   ┌────────────────────────┬────────────────────────┬──────────────┐   │
│   │     Auth Service       │    Invites Service     │ Projects API │   │
│   └──────────┬─────────────┴───────────┬────────────┴───────┬──────┘   │
└──────────────┼─────────────────────────┼────────────────────┼──────────┘
               │ MongoDB Drivers         │ PyMongo / Atlas    │
┌──────────────▼─────────────────────────▼────────────────────▼──────────┐
│                             DATABASES                                  │
│   - MongoDB (Atlas): Candidate Profiles, Sessions, Logs & Submissions  │
│   - PostgreSQL / SQL: Static Schemas, Approved Enterprise Domains      │
└────────────────────────────────────────┬───────────────────────────────┘
                                         │ JSON Config Context
┌────────────────────────────────────────▼───────────────────────────────┐
│                        AI MULTI-AGENT ENGINE                           │
│  - Orchestrator.py: Coordinates Asha, Ravi, Mira, Kenji, Leah, Observer│
│  - LLM / Prompts Core: System instruction mappings & Gemini Flash API  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Component | Technology | Badge | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript | `HTML5` `CSS3` `JS` | Clean responsive layout rendering, high-fidelity styling tokens, and interactive UI states. |
| **Backend API** | Python, Flask | `Python` `Flask` | REST APIs, authentication handling, database integration, and routing. |
| **Database** | MongoDB Atlas, SQL Schema | `MongoDB` `SQL` | Document store for active chat transcripts, candidate submissions, and relational domains data. |
| **AI Orchestration** | Google Gemini (Gemini Flash), Python LLM Core | `Gemini` `Python` | Multi-agent collaboration engine, observer telemetry, and Quinn evaluation framework. |
| **Authentication** | Custom Session Tokens, Werkzeug Hashing | `Security` `SHA-256` | Secure sessions, password hashing, and recruiter domain validation. |

---

## 🔄 Application Workflow

```
1. Recruiter Registration
   └─► Checks email domain validity (e.g., username@google.com)
2. Company Verification
   └─► Authorizes the recruiter's tenant space based on verified domain list
3. Project Creation
   └─► Recruiter setups role, description, code templates, and dynamic crisis trigger
4. Candidate Assignment
   └─► Recruiter inputs candidate details, generating a unique registration/invite link
5. Simulation Completion
   └─► Candidate enters the workspace, works with Asha, Ravi, Mira, etc., handles crisis, and submits code
6. AI Evaluation
   └─► Silent Observer compiles metrics; Quinn evaluates chat logs and code to generate a SkillRecord
7. Recruiter Review
   └─► Recruiter views candidate metrics, score charts, code diffs, and qualitative feedback
8. Hiring Decision
   └─► Recruiter marks the candidate as "Shortlisted", "On Track", or "At Risk" based on verified signals
```

---

## 📂 Folder Structure

The repository maintains a clean, modular folder layout separating the frontend templates, core Flask API endpoints, database structures, and the AI agent core:

```text
DayZero/
├── frontend/                   # UI Assets, Layout Pages & Styles
│   ├── css/                    # Custom styling stylesheets (dashboard.css)
│   ├── js/                     # Component controllers (dashboard.js, recruiter_app.js)
│   ├── pages/                  # Simulation pages (dashboard.html, recruiter_dashboard.html, results.html, roles.html)
│   └── index.html              # Landing page entry point link mapping
│
├── backend/                    # Core Python/Flask Application
│   ├── services/               # Simulation orchestrator models
│   │   └── orchestrator.py     # Live sprint orchestrator & task manager
│   ├── app.py                  # Main Flask Router & API endpoints
│   ├── auth.py                 # Candidate/Recruiter identity service
│   └── requirements.txt        # Backend dependencies
│
├── ai_engine/                  # Core AI Multi-Agent Core
│   ├── agents/                 # Customized agents configuration (PMAgent.py, BackendAgent.py, etc.)
│   ├── config/                 # Environment variables and API config
│   │   └── config.py           # Core variables configuration
│   └── core/                   # Generative AI client wrappers
│       ├── gemini_client.py    # Google Gemini generative client
│       ├── llm.py              # Large Language Model utility wrappers
│       └── prompts.py          # Dynamic agent context instructions & templates
│
├── db/                         # Database Configurations
│   └── schema.sql              # Static SQL table creation schemas for verified domains
│
├── tests/                      # Testing Framework
│   └── test.py                 # Core endpoint/simulation automation checks
│
├── .gitignore                  # Git tracking exclusion configuration
├── app.js                      # Landing page animation & interactive JS controllers
├── main.css                    # Modern visual styling stylesheet (Glassmorphism CSS)
├── requirements.txt            # Main Python system-level dependencies
└── README.md                   # Platform documentation
```

---

## ⚙️ Installation & Setup Guide

### Prerequisites
- Python 3.10+ installed
- MongoDB Atlas account (connection URI string required)
- Google Gemini API Key (or OpenAI API Key)

### 1. Clone the Repository
```bash
git clone https://github.com/Anishka2006/DayZero.git
cd DayZero
```

### 2. Backend & System Setup
Create and activate a virtual environment, then install Python dependencies:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate

# Install requirements
pip install -r backend/requirements.txt
pip install -r requirements.txt
```

### 3. Database Initialization
Ensure you have MongoDB running locally or on Atlas. Import SQL tables for domain validation if utilizing SQL databases:
```bash
psql -U your_postgres_user -d dayzero_db -f db/schema.sql
```

### 4. Environment Variables Configuration
Create a `.env` file in the root directory (and `/backend` directory):
```env
# Server Network Settings
PORT=8000
AUTH_PORT=8001
DAYZERO_LOG_LEVEL=INFO

# Database URIs
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/dayzero?retryWrites=true&w=majority
POSTGRES_URI=postgresql://your_db_user:your_db_password@localhost:5432/dayzero_db

# AI & LLM Providers
GEMINI_API_KEY=your_gemini_api_key_here
```

### 5. Run Locally
Run the Core Flask Application and Authentication Service:
```bash
# Terminal 1: Run core API routing (Port 8000/8001 defaults)
python backend/app.py

# Terminal 2: Run Auth identity service
python backend/auth.py

# Terminal 3: Serve the frontend templates (e.g. using VS Code Live Server or live-server node pkg)
npx live-server .
```

---

## 📡 API Endpoints

### 🔐 Auth Service
- `POST /api/signup` — Registers a candidate or recruiter. Personal domains (e.g. Gmail) are blocked for recruiter signups.
- `POST /api/login` — Auths candidates/recruiters; returns a JWT access token.
- `GET /api/user-profile` — Retrieves the details of an authenticated user profile.
- `GET /approved-recruiter-domains` — Retrieves list of domains authorized for recruiter workspace registration.

### 💼 Recruiter Service
- `POST /api/invites` — Creates a candidate invite, seeds their profile, and assigns the custom workspace configuration.
- `GET /api/invites` — Fetches candidate invitations matching `companyId` or `recruiterId`.
- `GET /api/invites/validate` — Validates unique invite links and synchronizes profile data.

### 🚀 Projects & Simulations API
- `POST /api/simulation/start` — Initializes a new workspace instance, starts a clock, and starts the team channel.
- `POST /api/simulation/event` — Relays candidate messages or workspace activities to the agent orchestrator.
- `POST /api/simulation/submit` — Formally locks candidate workspace inputs, stops timer, and calls Quinn's evaluator.

---

## 📸 Interface Preview (Screenshots)

### 1. Landing & Candidate Entry Page
> *High-fidelity hero layout detailing features, value proposition, and role selections.*
```
┌────────────────────────────────────────────────────────┐
│                        DayZero                         │
│  [Experience Work Before Your Day One]                 │
│                                                        │
│  [ Enter Sprint Room ]  [ Sign Up ]  [ Book Demo ]     │
└────────────────────────────────────────────────────────┘
```

### 2. The AI Sprint Room Workspace
> *Interactive Slack-style channels, file view tabs, and a code editor panel showing the starter code.*
```
┌────────────────────────────────────────────────────────┐
│ Channels     │ # dev-docs                             │
│ # planning   │ Asha (PM): Ravi, we need the rollback  │
│ # dev-docs   │ plans finalized by this afternoon.     │
│              ├────────────────────────────────────────┤
│ Files        │ rateLimit.js                           │
│ RateLimit.js │ function audit(event) {                │
│ app.js       │   console.log(event); // FIXME         │
└──────────────┴────────────────────────────────────────┘
```

### 3. Recruiter Dashboard & Candidate Review
> *Shows candidate directory, overall scores, and shortlist recommendations.*
```
┌────────────────────────────────────────────────────────┐
│ Candidate Profile: John Doe  | Score: 92% (Shortlisted)│
│                                                        │
│ Problem-Solving: [████████████░] 92                    │
│ Adaptability:    [██████████░░░] 85                    │
│ Communication:   [██████████░░░] 82                    │
└────────────────────────────────────────────────────────┘
```

---

## 🔒 Security Features

- **Dynamic Access Verification:** Authentication check verifying invite links and synchronization across workspace instances.
- **Enterprise Domain Validation:** Rejects public domains (Gmail, Yahoo, Hotmail) during recruiter sign-up. Automatically extracts company identities based on verified corporate emails.
- **Data Isolation:** User responses, code submissions, and chat histories are isolated per simulation session.

---

## 🗺️ Product Roadmap

- [ ] **AI Interview Agent:** Voice-interactive AI interviewers matching teammate contexts.
- [ ] **Video & Audio Assessment:** AI-analyzed video check-ins to monitor communication and alignment.
- [ ] **Dynamic Skill Graph:** Live interactive talent graphs illustrating specific sub-skill strengths.
- [ ] **ATS Integration:** Direct export parameters to Greenhouse, Lever, and Workable.
- [ ] **Resume Intelligence:** Machine learning parser highlighting candidates whose resumes contrast with simulator behavior.
- [ ] **Multi-Language Support:** Simulation workspaces and code evaluations localized in Spanish, French, Mandarin, and Hindi.

---

## 📈 Impact

- **For Candidates:** Gain invaluable, real-world project context. Showcase technical depth directly to top companies without resume bias.
- **For Recruiters:** Accelerate shortlists by up to **75%**. Gain bulletproof, verified signals regarding how candidates collaborate under pressure.
- **For Universities:** Bridge industry-academia misalignment by training students on authentic industrial scenarios.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 📞 Contact

**Contributors:** Anishka, Saavi, Richa, Neha, Akshaya       
**Project Link:** [LINK](https://github.com/Anishka2006/DayZero)  
**Demo Video Link:** [LINK](https://drive.google.com/file/d/1uaeXJTsX1YiQnDN5_-6x9MYpOOLvvur5/view?usp=sharing)

---
<p align="center"><i>DayZero — Experience Work Before Your Day One!</i></p>
