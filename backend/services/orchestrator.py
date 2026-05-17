from __future__ import annotations

import re
from copy import deepcopy
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from ai_engine.agents import BackendAgent, DataAnalystAgent, DesignerAgent, ObserverAgent, PMAgent, QAAgent


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


DEFAULT_MEMORY = {
    "candidate_plan_shared": False,
    "asked_clarification": False,
    "handled_crisis": False,
    "mentioned_tradeoff": False,
    "team_introduced": False,
    "candidate_introduced": False,
    "skill_focus": "communication",
    "crisis_already_triggered": False,
    "tests_run_count": 0,
    "failed_tests": [],
    "passed_tests": [],
    "timeline": [],
    "phase": "intro",
    "last_agent": None,
    "last_agents": [],
    "decisions": [],
    "blockers": [],
    "unresolved_risks": [],
    "referenced_files": [],
    "crisis_events": [],
    "crisis_count": 0,
    "current_crisis": None,
    "candidate_name": "",
    "user_message_count": 0,
    "simulation_done": False,
}

DEFAULT_SCORES = {
    "leadership": 50,
    "communication": 50,
    "ownership": 50,
    "prioritization": 50,
    "adaptability": 50,
    "technicalDepth": 50,
}


TASKS = {
    "security-patch": {
        "company": "Acme Corp",
        "channel": "security-rollout",
        "role": "Backend + Incident Response",
        "title": "Critical Security Patch & Architecture Audit",
        "deadline": 15,
        "difficulty": "High Pressure",
        "problem": "A high-severity vulnerability is active in a legacy service. The team must patch fast without breaking login or audit flow.",
        "crisis": "Exploit attempt confirmed in production. Leadership wants a safe ship/rollback call now.",
        "requirements": [
            "Identify smallest safe patch",
            "Define rollback trigger",
            "Protect login stability",
            "Write customer-safe update",
        ],
        "files": ["auth/sessionGuard.js", "auth/rateLimit.js", "security/auditLog.js"],
        "starter_code": """// Acme Corp — security patch
const attempts = {};

function allowRequest(userId, ip) {
  attempts[ip] = (attempts[ip] || 0) + 1;
  return true; // FIXME: exploit path still open
}

function audit(event) {
  console.log(event); // FIXME: not enough evidence for security review
}
""",
    },

    "mobile-growth": {
        "company": "Northstar Pay",
        "channel": "growth-lab",
        "role": "Product + Full Stack",
        "title": "Launch New Feature for Mobile Users",
        "deadline": 30,
        "difficulty": "Medium",
        "problem": "Mobile activation is dropping. The team needs user pain points, top 3 features, and a primary growth metric.",
        "crisis": "Leadership cuts scope. You can only ship one activation feature this cycle.",
        "requirements": [
            "Define user pain points",
            "Prioritize top 3 features",
            "Choose primary growth metric",
            "Explain tradeoff",
        ],
        "files": ["growth/featurePriorities.js", "growth/metricsPlan.js", "mobile/ActivationFlow.js"],
        "starter_code": """// Northstar Pay — mobile growth plan

const userPainPoints = [];

const featureIdeas = [
  "one-tap onboarding",
  "reward reminder",
  "personalized dashboard",
  "referral nudge"
];

function choosePrimaryMetric() {
  return ""; // FIXME: activation metric missing
}
""",
    },

    "docs-update": {
        "company": "Acme Corp",
        "channel": "dev-docs",
        "role": "Developer Experience",
        "title": "Update Documentation & Code Comments",
        "deadline": 45,
        "difficulty": "Low Pressure",
        "problem": "Recent API changes are undocumented. New engineers are misusing the service because comments and docs are stale.",
        "crisis": "A customer integration broke because docs still show the old payload.",
        "requirements": [
            "Document new API payload",
            "Add code comments",
            "Flag deprecated behavior",
            "Write migration note",
        ],
        "files": ["docs/apiChanges.md", "api/clientExample.js", "docs/migrationGuide.md"],
        "starter_code": """// API client example
// FIXME: docs still show old payload

function createPayment(user, amount) {
  return fetch("/api/payment", {
    method: "POST",
    body: JSON.stringify({ user, amount })
  });
}
""",
    },

    "fraud-dashboard": {
        "company": "Stripe",
        "channel": "fraud-detection",
        "role": "Fullstack + Data",
        "title": "Build a Real-time Fraud Detection Dashboard",
        "deadline": 5 * 24 * 60,
        "difficulty": "5-Day Sprint",
        "problem": "Risk analysts need a real-time dashboard to monitor transaction anomalies and respond before losses increase.",
        "crisis": "False positives spike during a major merchant sale. Analysts are losing trust in alerts.",
        "requirements": [
            "Show anomaly score",
            "Separate high-risk and false-positive signals",
            "Add analyst action queue",
            "Track alert precision",
        ],
        "files": ["fraud/anomalyRules.js", "dashboard/RiskQueue.js", "metrics/precisionTracker.js"],
        "starter_code": """// Stripe-style fraud dashboard

function classifyTransaction(txn) {
  if (txn.amount > 1000) return "high-risk";
  return "normal"; // FIXME: too naive, false positives rising
}
""",
    },

    "search-infra": {
        "company": "Google",
        "channel": "search-scale",
        "role": "Cloud Infrastructure + DevOps",
        "title": "Search Infrastructure Scale-up",
        "deadline": 5 * 24 * 60,
        "difficulty": "Premium Sprint",
        "problem": "Search traffic increased 10x. Current indexing and cache behavior cannot keep up.",
        "crisis": "Latency crosses SLO during peak traffic. Leadership asks for mitigation in 30 minutes.",
        "requirements": [
            "Identify bottleneck",
            "Propose cache strategy",
            "Define rollback/traffic-split plan",
            "Protect search quality",
        ],
        "files": ["infra/cachePolicy.js", "search/indexRouter.js", "ops/trafficSplit.js"],
        "starter_code": """// Search infra scaling

function routeQuery(query) {
  return primaryIndex.search(query); // FIXME: no fallback or cache path
}
""",
    },

    "ai-copilot": {
        "company": "Microsoft",
        "channel": "copilot-integration",
        "role": "AI Engineering + Frontend",
        "title": "AI Copilot Integration",
        "deadline": 5 * 24 * 60,
        "difficulty": "Premium Sprint",
        "problem": "A legacy enterprise app needs an LLM copilot, but user trust, hallucination risk, and UI placement are unresolved.",
        "crisis": "Copilot gives an overconfident wrong answer during customer demo prep.",
        "requirements": [
            "Add confidence state",
            "Design fallback behavior",
            "Create user feedback loop",
            "Limit unsafe actions",
        ],
        "files": ["ai/copilotPrompt.js", "ui/CopilotPanel.js", "safety/guardrails.js"],
        "starter_code": """// Enterprise Copilot

function buildCopilotAnswer(question, context) {
  return llm.ask(question + context); // FIXME: no confidence, no guardrails
}
""",
    },

    "search-ranking": {
        "company": "Airbnb",
        "channel": "ranking-growth",
        "role": "Backend + Data Analytics",
        "title": "Optimize Search Ranking Algorithm",
        "deadline": 5 * 24 * 60,
        "difficulty": "Active Project",
        "problem": "Booking conversion is flat. Ranking ignores recent user behavior and overpromotes low-quality listings.",
        "crisis": "Host complaints rise after ranking experiment shifts traffic too aggressively.",
        "requirements": [
            "Define ranking signals",
            "Protect listing quality",
            "Measure conversion lift",
            "Avoid unfair traffic collapse",
        ],
        "files": ["ranking/scoringModel.js", "experiments/abTestConfig.js", "analytics/conversion.js"],
        "starter_code": """// Search ranking model

function scoreListing(listing) {
  return listing.price * -1; // FIXME: only ranks by cheapest price
}
""",
    },

    "surge-api": {
        "company": "Uber",
        "channel": "surge-refactor",
        "role": "Backend Engineer",
        "title": "Surge Pricing API Refactor",
        "deadline": 5 * 24 * 60,
        "difficulty": "Active Project",
        "problem": "Legacy surge pricing logic cannot handle 10k requests/sec and causes inconsistent driver/rider pricing.",
        "crisis": "City event causes traffic spike. Surge API starts returning mismatched prices.",
        "requirements": [
            "Design scalable pricing service",
            "Add cache/queue strategy",
            "Handle spike traffic",
            "Define consistency checks",
        ],
        "files": ["pricing/surgeEngine.js", "infra/priceCache.js", "api/pricingRoute.js"],
        "starter_code": """// Surge pricing

function calculateSurge(demand, supply) {
  return demand / supply; // FIXME: no caps, no consistency, no fallback
}
""",
    },

    "video-encoding": {
        "company": "Netflix",
        "channel": "encoding-pipeline",
        "role": "Backend Engineer",
        "title": "Video Encoding Pipeline",
        "deadline": 5 * 24 * 60,
        "difficulty": "Active Project",
        "problem": "Encoding latency is too high. Distributed workers need better job assignment and retry behavior.",
        "crisis": "A new release causes encoding queue backlog before regional launch.",
        "requirements": [
            "Reduce queue latency",
            "Add worker retry logic",
            "Prevent duplicate encoding",
            "Track job status",
        ],
        "files": ["encoding/jobQueue.js", "workers/encoderWorker.js", "monitoring/jobStatus.js"],
        "starter_code": """// Video encoding worker

function assignJob(worker, job) {
  worker.currentJob = job;
  return worker.process(job); // FIXME: no retry or duplicate protection
}
""",
    },

    "playlist-generator": {
        "company": "Spotify",
        "channel": "playlist-ml",
        "role": "Data + Backend",
        "title": "Personalized Playlist Generator",
        "deadline": 5 * 24 * 60,
        "difficulty": "Active Project",
        "problem": "Recommendation model repeats popular songs and fails to surface obscure tracks based on taste.",
        "crisis": "User retention drops after playlists feel repetitive for power users.",
        "requirements": [
            "Improve diversity",
            "Use listening history",
            "Reduce repeated artists",
            "Track skip rate",
        ],
        "files": ["ml/recommendationRules.js", "backend/playlistApi.js", "metrics/skipRate.js"],
        "starter_code": """// Playlist recommendation

function recommendTracks(history, catalog) {
  return catalog.sort((a, b) => b.popularity - a.popularity).slice(0, 20);
  // FIXME: too popularity-biased
}
""",
    },

    "vr-marketplace": {
        "company": "Meta",
        "channel": "horizon-marketplace",
        "role": "Fullstack Developer",
        "title": "VR Horizon World Integration",
        "deadline": 5 * 24 * 60,
        "difficulty": "Active Project",
        "problem": "Virtual economy marketplace needs frontend flows for buying, listing, and trust safety.",
        "crisis": "Unsafe listings appear in test world. Trust and moderation flow is missing.",
        "requirements": [
            "Design marketplace UI",
            "Add listing validation",
            "Protect purchase flow",
            "Flag unsafe content",
        ],
        "files": ["marketplace/ListingCard.js", "marketplace/PurchaseFlow.js", "safety/moderationRules.js"],
        "starter_code": """// VR marketplace listing

function publishListing(item) {
  return save(item); // FIXME: no moderation or validation
}
""",
    },
}


class SimulationOrchestrator:
    def __init__(self) -> None:
        self.pm_agent = PMAgent()
        self.backend_agent = BackendAgent()
        self.designer_agent = DesignerAgent()
        self.qa_agent = QAAgent()
        self.data_agent = DataAnalystAgent()
        self.observer_agent = ObserverAgent()
        self.sessions: dict[str, dict[str, Any]] = {}

    def start_simulation(
        self,
        task_id: str | None = None,
        role: str | None = None,
        participant_name: str | None = None,
        task_context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        task = deepcopy(self._select_task(task_id=task_id, role=role, task_context=task_context))
        memory = deepcopy(DEFAULT_MEMORY)
        scores = deepcopy(DEFAULT_SCORES)
        session_id = str(uuid4())

        if participant_name:
            memory["candidate_name"] = participant_name

        timeline_event = {
            "title": "Simulation started",
            "description": f"{task['company']} opened {task['title'].lower()} and the team introduced itself.",
            "created_at": _utc_now(),
        }
        memory["timeline"].append(timeline_event)
        memory["team_introduced"] = True

        initial_messages = self._initial_messages_for(task)
        transcript = [
            self._message_payload(entry, created_at=_utc_now())
            for entry in initial_messages
        ]

        observer_note = "Room opened. Team introduced itself and asked for the candidate's introduction."

        self.sessions[session_id] = {
            "id": session_id,
            "task": task,
            "memory": memory,
            "scores": scores,
            "transcript": transcript,
            "observer_notes": [observer_note],
            "submission": "",
            "participant_name": participant_name or "You",
        }

        return {
            "session_id": session_id,
            "task": task,
            "phase": memory["phase"],
            "memory": deepcopy(memory),
            "scores": deepcopy(scores),
            "timeline_event": timeline_event,
            "initial_messages": deepcopy(transcript),
            "messages": deepcopy(transcript),
            "observer_note": observer_note,
            "observer_notes": [observer_note],
            "deadline_minutes": task["deadline"],
            "crisis_status": task["crisis"],
            "task_text": task["problem"],
            "participant_name": participant_name or "You",
            "simulation_done": False,
            "report": None,
        }

    def get_session(self, session_id: str) -> dict[str, Any] | None:
        session = self.sessions.get(session_id)
        if not session:
            return None

        return {
            "session_id": session["id"],
            "task": deepcopy(session["task"]),
            "memory": deepcopy(session["memory"]),
            "scores": deepcopy(session["scores"]),
            "messages": deepcopy(session["transcript"]),
            "observer_notes": list(session.get("observer_notes") or []),
            "submission": session.get("submission") or "",
            "participant_name": session.get("participant_name") or "You",
            "phase": session["memory"].get("phase", "intro"),
            "simulation_done": session["memory"].get("simulation_done", False),
        }

    def handle_event(self, event: dict[str, Any]) -> dict[str, Any]:
        event = deepcopy(event)
        session = self._resolve_session(event)

        memory = session["memory"]
        scores = session["scores"]
        task = session["task"]

        normalized_type = self._normalize_event_type(event)
        event["event_type"] = normalized_type
        event["task"] = task

        candidate_message = str(event.get("candidate_message") or event.get("message") or "").strip()
        code = str(event.get("code") or "").strip()

        if candidate_message:
            event["candidate_message"] = candidate_message
            session["transcript"].append(
                {
                    "speaker_name": session.get("participant_name") or event.get("candidate_name") or "You",
                    "speaker_title": "You",
                    "avatar": "Y",
                    "role": "user",
                    "message": self._shorten_user_message(candidate_message),
                    "created_at": _utc_now(),
                }
            )

        self._update_memory(memory, event)
        self._update_scores(scores, event)

        recent_room_context = self._recent_room_context(session)

        if normalized_type == "crisis_triggered":
            memory["crisis_already_triggered"] = True
            crisis_event = self._next_crisis_event(task, memory)
            event["crisis_event"] = crisis_event
            memory["current_crisis"] = crisis_event
            self._remember(memory, "crisis_events", crisis_event.get("message") or task.get("crisis"))

        new_messages = self._generate_agent_messages(session, event, recent_room_context)

        session["transcript"].extend(new_messages)

        last_message = new_messages[-1] if new_messages else None
        memory["last_agent"] = last_message.get("speaker_name") if last_message else None
        memory["last_agents"] = [
            msg.get("speaker_name")
            for msg in new_messages
            if msg.get("speaker_name")
        ]

        memory["phase"] = self._resolve_phase(event, memory)

        timeline_event = self._timeline_event_for(event, new_messages, candidate_message, task)
        memory["timeline"].append(timeline_event)

        observer_note = self._observer_note_for(event, memory, scores, recent_room_context)
        if observer_note:
            session["observer_notes"].append(observer_note)

        if code and normalized_type == "submit_solution":
            session["submission"] = code
        elif candidate_message and normalized_type == "submit_solution":
            session["submission"] = candidate_message

        report = None
        if normalized_type == "submit_solution" or memory.get("simulation_done"):
            report = self._build_final_report(session)

        primary_message = new_messages[0] if new_messages else {}

        return {
            "session_id": session["id"],
            "agent": self._profile_from_message(primary_message),
            "message": primary_message.get("message") or "",
            "new_messages": deepcopy(new_messages),
            "messages": deepcopy(session["transcript"]),
            "memory": deepcopy(memory),
            "scores": deepcopy(scores),
            "timeline_event": timeline_event,
            "crisis_event": deepcopy(event.get("crisis_event")),
            "observer_note": observer_note,
            "observer_notes": list(session.get("observer_notes") or []),
            "phase": memory["phase"],
            "task": deepcopy(task),
            "simulation_done": memory.get("simulation_done", False),
            "report": report,
        }

    def evaluate_work(self, submission: str, role: str) -> dict[str, Any]:
        bootstrap = self.start_simulation(role=role)
        event = {
            "session_id": bootstrap["session_id"],
            "event_type": "submit_solution",
            "candidate_message": submission[:700],
            "code": submission,
            "phase": "submission",
        }
        result = self.handle_event(event)
        report = result.get("report") or {}

        return {
            "score": report.get("overall_score", self._average_score(result["scores"])),
            "feedback": report.get("summary") or result["message"],
            "report": report,
        }

    def run_simulation(self, user_input: str) -> dict[str, str]:
        memory = deepcopy(DEFAULT_MEMORY)
        scores = deepcopy(DEFAULT_SCORES)
        task = self._task_payload("mobile-growth")

        event = {
            "event_type": "candidate_message",
            "candidate_message": user_input,
            "task": task,
        }

        fake_session = {
            "task": task,
            "memory": memory,
            "scores": scores,
            "participant_name": "You",
            "transcript": [],
        }

        messages = self._generate_agent_messages(fake_session, event, [])
        return {msg["speaker_name"].lower(): msg["message"] for msg in messages}

    def _resolve_session(self, event: dict[str, Any]) -> dict[str, Any]:
        session_id = event.get("session_id")

        if session_id and session_id in self.sessions:
            session = self.sessions[session_id]
            candidate_name = event.get("candidate_name")

            if candidate_name:
                session["participant_name"] = str(candidate_name)
                session["memory"]["candidate_name"] = str(candidate_name)

            return session

        task = deepcopy(
            self._select_task(
                task_id=event.get("task_id"),
                role=event.get("role"),
                task_context=event.get("task_context"),
            )
        )
        candidate_name = str(event.get("candidate_name") or "You")

        session = {
            "id": session_id or str(uuid4()),
            "task": task,
            "memory": deepcopy(event.get("memory") or DEFAULT_MEMORY),
            "scores": deepcopy(event.get("scores") or DEFAULT_SCORES),
            "transcript": [],
            "observer_notes": [],
            "submission": "",
            "participant_name": candidate_name,
        }

        if candidate_name != "You":
            session["memory"]["candidate_name"] = candidate_name

        self.sessions[session["id"]] = session
        return session

    def _select_task(
        self,
        task_id: str | None = None,
        role: str | None = None,
        task_context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        if task_id and task_id in TASKS:
            return self._task_payload(task_id, task_context=task_context)

        role_text = str(role or "").lower()

        if any(token in role_text for token in ("backend", "security", "infra", "platform", "incident")):
            return self._task_payload("security-patch", task_context=task_context)

        if any(token in role_text for token in ("product", "growth", "mobile", "full stack", "fullstack")):
            return self._task_payload("mobile-growth", task_context=task_context)

        if any(token in role_text for token in ("data", "analytics", "fraud")):
            return self._task_payload("fraud-dashboard", task_context=task_context)

        if any(token in role_text for token in ("design", "designer", "ux", "ui")):
            return self._task_payload("docs-update", task_context=task_context)

        return self._task_payload("mobile-growth", task_context=task_context)

    def _task_payload(self, task_id: str, task_context: dict[str, Any] | None = None) -> dict[str, Any]:
        task = deepcopy(TASKS[task_id])
        task["id"] = task_id
        if task_context:
            task = self._apply_task_context(task, task_context)
        return self._enrich_task_payload(task)

    def _apply_task_context(self, task: dict[str, Any], task_context: dict[str, Any]) -> dict[str, Any]:
        context = task_context if isinstance(task_context, dict) else {}
        if not context:
            return task

        task["source_task_id"] = task.get("id")
        task["dashboard_task_id"] = context.get("id") or task.get("id")
        task["company"] = str(context.get("company") or task.get("company"))
        task["title"] = str(context.get("title") or task.get("title"))
        task["role"] = str(context.get("role") or task.get("role"))
        task["problem"] = str(context.get("description") or task.get("problem"))
        task["difficulty"] = str(context.get("difficulty") or task.get("difficulty"))
        task["channel"] = self._slugify(context.get("label") or context.get("title") or task.get("channel"))

        skills = context.get("skills")
        if isinstance(skills, list) and skills:
            task["requirements"] = [str(skill) for skill in skills if str(skill).strip()]

        workspace_files = context.get("workspaceFiles") or context.get("workspace_files")
        if isinstance(workspace_files, list):
            file_names = []
            for item in workspace_files:
                if isinstance(item, dict):
                    name = item.get("name") or item.get("path")
                else:
                    name = item
                if name and str(name).strip():
                    file_names.append(str(name).strip())
            if file_names:
                task["files"] = file_names

        deadline = self._deadline_from_text(context.get("time"))
        if deadline:
            task["deadline"] = deadline

        return task

    def _enrich_task_payload(self, task: dict[str, Any]) -> dict[str, Any]:
        domain = self._task_domain(task)
        task["domain"] = domain
        task["workspace_files"] = self._workspace_files_for(task, domain)
        task["room"] = self._room_context_for(task, domain)
        task["crisis_events"] = self._crisis_events_for(task, domain)
        return task

    def _room_context_for(self, task: dict[str, Any], domain: str) -> dict[str, Any]:
        deadline = int(task.get("deadline") or 45)
        severity = self._severity_for(task)
        company = task.get("company") or "the company"
        title = task.get("title") or "current task"
        sprint = self._sprint_for(task, domain)
        affected = {
            "backend": "API users and internal operators",
            "frontend": "new and returning users in the active flow",
            "design": "users trying to recover from a confusing state",
            "data": "leadership and teams relying on this metric",
            "pm": "customers, support, and the launch team",
        }.get(domain, "customers and the delivery team")

        blockers = self._blockers_for(task, domain)
        return {
            "company": company,
            "channel": task.get("channel") or "war-room",
            "severity": severity,
            "urgency": self._urgency_for(task),
            "sprint": sprint,
            "deadline": deadline,
            "affected_users": affected,
            "business_impact": f"{company} risks losing trust if {title.lower()} is handled slowly or vaguely.",
            "risk": task.get("crisis") or "A rushed fix may create a second failure path.",
            "blockers": blockers,
            "timeline": [
                f"T-45: {sprint} review opened.",
                f"T-25: {blockers[0]}",
                f"T-10: leadership wants a decision and owner.",
            ],
        }

    def _workspace_files_for(self, task: dict[str, Any], domain: str) -> list[dict[str, str]]:
        files = [str(item) for item in task.get("files") or [] if str(item).strip()]
        if not files:
            files = {
                "backend": ["api/service.js", "logs/error.log", "docs/rollback-plan.md"],
                "frontend": ["ui/ActiveFlow.jsx", "styles/responsive.css", "docs/user-states.md"],
                "design": ["design/flow-notes.md", "ui/ErrorState.jsx", "research/user-feedback.md"],
                "data": ["metrics/dashboard.csv", "analytics/query.sql", "docs/metric-definition.md"],
                "pm": ["docs/decision-brief.md", "slack/customer-escalation.txt", "metrics/impact.csv"],
            }.get(domain, ["docs/task-brief.md", "logs/room-notes.txt"])

        workspace: list[dict[str, str]] = []
        for path in files:
            workspace.append(
                {
                    "path": path,
                    "name": path.split("/")[-1],
                    "kind": self._file_kind(path),
                    "signal": self._file_signal(path, domain),
                }
            )
        return workspace

    def _crisis_events_for(self, task: dict[str, Any], domain: str) -> list[dict[str, str]]:
        company = task.get("company") or "Leadership"
        base = [
            {
                "severity": "high",
                "message": task.get("crisis") or f"{company} escalation just landed in the room.",
                "impact": "The team needs a tighter decision and a visible owner.",
            },
            {
                "severity": "critical",
                "message": "Error rate and stakeholder pressure both moved the wrong way.",
                "impact": "The next response must name what changes now and what waits.",
            },
        ]
        if domain == "data":
            base.append(
                {
                    "severity": "high",
                    "message": "Leadership is quoting a dashboard number that may be stale.",
                    "impact": "Data needs one trusted metric and one caveat before the update.",
                }
            )
        elif domain == "design":
            base.append(
                {
                    "severity": "high",
                    "message": "Support says users are confused by the recovery path.",
                    "impact": "The user-facing state needs clearer copy before rollout.",
                }
            )
        else:
            base.append(
                {
                    "severity": "high",
                    "message": "A second region is reporting the same symptom.",
                    "impact": "QA and engineering need proof that the fix is not local-only.",
                }
            )
        return base

    def _next_crisis_event(self, task: dict[str, Any], memory: dict[str, Any]) -> dict[str, str]:
        events = task.get("crisis_events") or self._crisis_events_for(task, task.get("domain") or self._task_domain(task))
        if not events:
            return {
                "severity": "high",
                "message": task.get("crisis") or "The room pressure increased.",
                "impact": "The next response needs a clearer decision.",
            }
        count = max(0, int(memory.get("crisis_count", 1)) - 1)
        return deepcopy(events[count % len(events)])

    def _task_domain(self, task: dict[str, Any]) -> str:
        role = str(task.get("role") or "").lower()
        if any(token in role for token in ("data", "analyst", "analytics")):
            return "data"
        if any(token in role for token in ("designer", "design", "ux")):
            return "design"
        if any(token in role for token in ("frontend", "front-end", "ui")):
            return "frontend"
        if any(token in role for token in ("backend", "infra", "platform", "devops", "security")):
            return "backend"
        if any(token in role for token in ("product", "pm")):
            return "pm"

        text = " ".join(
            str(task.get(key) or "")
            for key in ("role", "title", "problem", "channel")
        ).lower()
        files = " ".join(str(item) for item in task.get("files") or []).lower()
        combined = f"{text} {files}"
        if any(token in combined for token in ("metric", "analytics", "dashboard", "data", "retention", "experiment", "forecast", "sql")):
            return "data"
        if any(token in combined for token in ("ui", "ux", "design", "screen", "mobile", "accessibility", "flow", "onboarding")):
            return "design" if "designer" in combined or "design" in combined else "frontend"
        if any(token in combined for token in ("api", "backend", "infra", "database", "cache", "queue", "security", "scaling", "worker", "service")):
            return "backend"
        if any(token in combined for token in ("product", "launch", "priority", "scope", "stakeholder", "growth")):
            return "pm"
        return "pm"

    def _severity_for(self, task: dict[str, Any]) -> str:
        text = f"{task.get('difficulty', '')} {task.get('problem', '')} {task.get('crisis', '')}".lower()
        if any(token in text for token in ("critical", "p0", "outage", "exploit", "sev1", "high pressure")):
            return "critical"
        if any(token in text for token in ("high", "risk", "deadline", "spike", "failing")):
            return "high"
        return "medium"

    def _urgency_for(self, task: dict[str, Any]) -> str:
        deadline = int(task.get("deadline") or 45)
        if deadline <= 30:
            return "active incident, minutes matter"
        if deadline <= 90:
            return "live sprint pressure"
        return "multi-day sprint with leadership checkpoints"

    def _sprint_for(self, task: dict[str, Any], domain: str) -> str:
        company = task.get("company") or "Company"
        labels = {
            "backend": "Reliability and release safety",
            "frontend": "Customer flow recovery",
            "design": "User trust and clarity",
            "data": "Metrics confidence",
            "pm": "Launch decision and scope control",
        }
        return f"{company} {labels.get(domain, 'delivery sprint')}"

    def _blockers_for(self, task: dict[str, Any], domain: str) -> list[str]:
        files = task.get("workspace_files") or []
        first_file = files[0]["path"] if files else "the shared workspace"
        return {
            "backend": [
                f"{first_file} still has an unsafe failure path.",
                "Rollback confidence is unclear.",
                "Logs and code need to agree before the team calls root cause.",
            ],
            "frontend": [
                f"{first_file} does not make the broken state obvious enough.",
                "Mobile behavior has not been validated.",
                "Recovery copy is still vague.",
            ],
            "design": [
                f"{first_file} leaves the user unsure what happens next.",
                "Accessibility and empty states are not signed off.",
                "Support needs customer-safe language.",
            ],
            "data": [
                f"{first_file} may be using a stale or mixed metric definition.",
                "The segment driving the change is not isolated.",
                "Leadership needs a caveat with the number.",
            ],
            "pm": [
                "The team has not agreed on the smallest safe scope.",
                "Ownership for the next update is unclear.",
                "Customer impact is not stated tightly enough.",
            ],
        }.get(domain, ["The room needs a clearer decision."])

    def _file_kind(self, path: str) -> str:
        lower = path.lower()
        if lower.endswith(".csv"):
            return "data"
        if "log" in lower:
            return "log"
        if lower.endswith((".md", ".txt")):
            return "brief"
        if lower.endswith((".js", ".jsx", ".ts", ".tsx", ".py")):
            return "code"
        return "workspace"

    def _file_signal(self, path: str, domain: str) -> str:
        lower = path.lower()
        if "log" in lower:
            return "Shows the current failure pattern and timing."
        if "metric" in lower or "analytics" in lower or lower.endswith(".csv"):
            return "Shows the evidence trend the team should cite carefully."
        if "rollback" in lower:
            return "Defines the safest fallback and trigger."
        if domain in ("frontend", "design") and any(token in lower for token in ("ui", "flow", "screen", "component")):
            return "Shows what the user sees during the risky state."
        return "Contains task-specific context the room should reference."

    def _deadline_from_text(self, value: Any) -> int | None:
        text = str(value or "").lower()
        match = re.search(r"\d+", text)
        if not match:
            return None
        number = int(match.group(0))
        if "day" in text:
            return number * 24 * 60
        if "hour" in text:
            return number * 60
        return number

    def _slugify(self, value: Any) -> str:
        slug = re.sub(r"[^a-z0-9]+", "-", str(value or "war-room").lower()).strip("-")
        return slug[:48] or "war-room"

    def _initial_messages_for(self, task: dict[str, Any]) -> list[dict[str, Any]]:
        room = task.get("room") or {}
        blockers = room.get("blockers") or []
        first_blocker = blockers[0] if blockers else task.get("problem")
        messages = [
            {
                "name": "Asha",
                "role": "Product Manager",
                "avatar": "A",
                "message": (
                    f"Hey, I am Asha, PM for {task['company']}. "
                    f"We are in #{task['channel']} and it is already moving: {room.get('severity', 'active')} pressure, {task['deadline']} mins."
                ),
            },
            {
                "name": "Ravi",
                "role": "Engineering Lead",
                "avatar": "R",
                "message": f"I am Ravi on engineering. I am looking at {self._first_workspace_file(task, 'code')} first because that is where the risky path shows up.",
            },
            {
                "name": "Kenji",
                "role": "QA Engineer",
                "avatar": "K",
                "message": (
                    "Kenji from QA here. I am fine moving fast, but I need proof before we call this safe. "
                    f"Blocker: {first_blocker}"
                ),
            },
        ]

        if task.get("domain") in ("frontend", "design", "pm"):
            messages.insert(
                2,
                {
                    "name": "Mira",
                    "role": "Product Designer",
                    "avatar": "M",
                    "message": f"Mira from design. I am watching what the user actually sees in {self._first_workspace_file(task, 'brief')}.",
                },
            )

        if task.get("domain") == "data":
            messages.insert(
                2,
                {
                    "name": "Leah",
                    "role": "Data Analyst",
                    "avatar": "L",
                    "message": f"Leah on data. I am checking whether {self._first_workspace_file(task, 'data')} is clean enough to cite out loud.",
                },
            )

        messages.append(
            {
                "name": "Asha",
                "role": "Product Manager",
                "avatar": "A",
                "message": "Before we jump in, give us a quick intro and the first call you want the room to make.",
            }
        )

        return messages

        return [
            {
                "name": "Asha",
                "role": "Product Manager",
                "avatar": "A",
                "message": (
                    f"Hi, I am Asha, the product manager for {task['company']}. "
                    f"We are in #{task['channel']}; before we jump in, please introduce yourself and how you approach this kind of work."
                ),
            },
            {
                "name": "Ravi",
                "role": "Engineering Lead",
                "avatar": "R",
                "message": "I am Ravi, engineering lead. I will watch contracts, failure modes, and what can ship safely.",
            },
            {
                "name": "Mira",
                "role": "Product Designer",
                "avatar": "M",
                "message": "I am Mira, product designer. I will keep the user-facing path clear, calm, and trustworthy.",
            },
            {
                "name": "Kenji",
                "role": "QA Engineer",
                "avatar": "K",
                "message": (
                    "I am Kenji, QA engineer. I will press on edge cases and proof before we call anything done. "
                    f"Current issue: {task['problem']}"
                ),
            },
        ]

        return [
            {
                "name": "Asha",
                "role": "Product Manager",
                "avatar": "A",
                "message": f"hey, welcome. we’re in #{task['channel']} and this is already moving. can you jump in?",
            },
            {
                "name": "Ravi",
                "role": "Engineering Lead",
                "avatar": "R",
                "message": f"quick scope check — are we stabilizing {task['title'].lower()} or trying to redesign too?",
            },
            {
                "name": "Mira",
                "role": "Product Designer",
                "avatar": "M",
                "message": "please don’t overbuild the whole thing. make the broken path feel trustworthy first.",
            },
            {
                "name": "Kenji",
                "role": "QA Engineer",
                "avatar": "K",
                "message": f"i can reproduce the risky path. current issue: {task['problem']}",
            },
        ]

    def _first_workspace_file(self, task: dict[str, Any], preferred_kind: str | None = None) -> str:
        files = task.get("workspace_files") or []
        if preferred_kind:
            for item in files:
                if item.get("kind") == preferred_kind:
                    return item.get("path") or item.get("name") or "the shared file"
        if files:
            return files[0].get("path") or files[0].get("name") or "the shared file"
        raw_files = task.get("files") or []
        return str(raw_files[0]) if raw_files else "the shared file"

    def _normalize_event_type(self, event: dict[str, Any]) -> str:
        event_type = str(event.get("event_type") or "candidate_message").strip().lower()

        if event_type == "run_tests":
            results = event.get("test_results") or {}
            failed = results.get("failed") or []
            passed = results.get("passed") or []

            if failed:
                return "tests_failed"

            if passed:
                return "tests_passed"

        return event_type

    def _update_memory(self, memory: dict[str, Any], event: dict[str, Any]) -> None:
        event_type = str(event.get("event_type") or "")
        message = str(event.get("candidate_message") or "").lower()
        original_message = str(event.get("candidate_message") or "").strip()
        test_results = event.get("test_results") or {}
        task = event.get("task") or {}
        active_file = str(event.get("active_file") or "").strip()

        if original_message:
            memory["user_message_count"] = int(memory.get("user_message_count", 0)) + 1
            memory["skill_focus"] = self._skill_focus_for(memory, event)
            event["skill_focus"] = memory["skill_focus"]
            self._capture_memory_signals(memory, event, task)

        if memory["user_message_count"] >= 12:
            memory["simulation_done"] = True

        extracted_name = self._extract_candidate_name(original_message)
        if extracted_name:
            memory["candidate_name"] = extracted_name

        if original_message and (extracted_name or self._candidate_intro_like(original_message)):
            memory["candidate_introduced"] = True
            event["candidate_introduction_detected"] = True

        plan_signal = any(token in message for token in ("plan", "first", "then", "priority", "i'll", "i will", "ship"))
        if plan_signal:
            memory["candidate_plan_shared"] = True
            event["plan_signal_detected"] = True

        clarification_signal = any(token in message for token in ("clarify", "why", "what exactly", "which", "can you confirm", "what does"))
        if clarification_signal:
            memory["asked_clarification"] = True
            event["clarification_signal_detected"] = True

        tradeoff_signal = any(token in message for token in ("tradeoff", "cut", "focus", "scope", "defer"))
        if tradeoff_signal:
            memory["mentioned_tradeoff"] = True
            event["tradeoff_signal_detected"] = True

        if event_type == "crisis_triggered":
            memory["handled_crisis"] = True
            memory["crisis_count"] = int(memory.get("crisis_count", 0)) + 1

        if event_type in ("tests_failed", "tests_passed"):
            memory["tests_run_count"] = int(memory.get("tests_run_count", 0)) + 1
            memory["failed_tests"] = list(test_results.get("failed") or [])
            memory["passed_tests"] = list(test_results.get("passed") or [])

        if active_file:
            self._remember(memory, "referenced_files", active_file)

    def _capture_memory_signals(self, memory: dict[str, Any], event: dict[str, Any], task: dict[str, Any]) -> None:
        message = str(event.get("candidate_message") or "").strip()
        lowered = message.lower()
        if not message:
            return

        if any(token in lowered for token in ("we should", "i will", "i'll", "decision", "first", "ship", "rollback", "cut")):
            self._remember(memory, "decisions", self._short_memory_item(message))

        if any(token in lowered for token in ("blocked", "blocker", "can't", "cannot", "waiting", "risk", "fails", "failing")):
            self._remember(memory, "blockers", self._short_memory_item(message))

        if any(token in lowered for token in ("risk", "unsafe", "edge", "regression", "unknown", "not sure", "concern")):
            self._remember(memory, "unresolved_risks", self._short_memory_item(message))

        known_files = []
        for item in task.get("workspace_files") or []:
            if isinstance(item, dict):
                known_files.extend([str(item.get("path") or ""), str(item.get("name") or "")])
        known_files.extend(str(item) for item in task.get("files") or [])
        for path in known_files:
            path = path.strip()
            if path and path.lower() in lowered:
                self._remember(memory, "referenced_files", path)

        for match in re.findall(r"[\w./-]+\.(?:js|jsx|ts|tsx|py|md|txt|csv|log|sql)", message):
            self._remember(memory, "referenced_files", match)

    def _remember(self, memory: dict[str, Any], key: str, value: Any, limit: int = 8) -> None:
        item = str(value or "").strip()
        if not item:
            return
        items = list(memory.get(key) or [])
        if item in items:
            items.remove(item)
        items.append(item)
        memory[key] = items[-limit:]

    def _short_memory_item(self, text: str, limit: int = 140) -> str:
        cleaned = " ".join(str(text or "").split())
        if len(cleaned) <= limit:
            return cleaned
        return cleaned[: limit - 3].rstrip() + "..."

    def _update_scores(self, scores: dict[str, int], event: dict[str, Any]) -> None:
        message = str(event.get("candidate_message") or "").lower()
        event_type = str(event.get("event_type") or "")

        if event.get("candidate_introduction_detected"):
            self._bump(scores, "communication", 4)

        if any(token in message for token in ("plan", "first", "then", "priority")):
            self._bump(scores, "leadership", 8)
            self._bump(scores, "communication", 5)

        if any(token in message for token in ("clarify", "why", "what exactly", "what does")):
            self._bump(scores, "communication", 6)
            self._bump(scores, "technicalDepth", 3)

        if any(token in message for token in ("tradeoff", "cut", "focus", "deadline", "scope")):
            self._bump(scores, "prioritization", 8)
            self._bump(scores, "leadership", 4)

        if event_type == "crisis_triggered":
            self._bump(scores, "adaptability", 10)
            self._bump(scores, "ownership", 6)

        if event_type in ("tests_failed", "tests_passed"):
            self._bump(scores, "technicalDepth", 5)
            self._bump(scores, "ownership", 3)

        if event_type == "tests_passed":
            self._bump(scores, "technicalDepth", 12)
            self._bump(scores, "communication", 2)

        if event_type == "tests_failed":
            self._bump(scores, "technicalDepth", -2)
            self._bump(scores, "ownership", 2)

    def _generate_agent_messages(
        self,
        session: dict[str, Any],
        event: dict[str, Any],
        room_context: list[str],
    ) -> list[dict[str, Any]]:
        memory = session["memory"]
        scores = session["scores"]

        lineup = self._select_agent_lineup(event, memory)
        generated: list[dict[str, Any]] = []
        rolling_context = list(room_context)

        for index, agent in enumerate(lineup):
            agent_event = {
                **event,
                "room_context": rolling_context[-5:],
                "candidate_name": memory.get("candidate_name") or session.get("participant_name") or "",
                "requires_candidate_intro": not memory.get("candidate_introduced", False),
                "skill_focus": memory.get("skill_focus") or event.get("skill_focus"),
                "speaker_position": index + 1,
                "team_lineup": [teammate.name for teammate in lineup],
                "previous_agent_reply": generated[-1]["message"] if generated else "",
                "room_pressure": self._pressure_level(session["task"]),
            }

            reply = agent.generate_response(agent_event, memory, scores)

            if not reply:
                reply = self._safe_fallback_for(agent, event)

            payload = self._message_payload(agent.profile(), self._shorten_agent_reply(reply))
            generated.append(payload)
            rolling_context.append(f"{payload['speaker_name']}: {payload['message']}")

        return generated

    def _observer_note_for(
        self,
        event: dict[str, Any],
        memory: dict[str, Any],
        scores: dict[str, int],
        room_context: list[str],
    ) -> str:
        event_type = str(event.get("event_type") or "")
        should_observe = event_type in ("crisis_triggered", "tests_failed", "tests_passed", "submit_solution")
        should_observe = should_observe or bool(event.get("candidate_introduction_detected"))
        should_observe = should_observe or bool(event.get("plan_signal_detected"))
        should_observe = should_observe or bool(event.get("clarification_signal_detected"))
        should_observe = should_observe or bool(event.get("tradeoff_signal_detected"))
        should_observe = should_observe or bool(memory.get("simulation_done"))

        if not should_observe:
            return ""

        observer_event = {**event, "room_context": room_context}
        if event.get("candidate_introduction_detected"):
            observer_event["event_type"] = "candidate_introduction"

        return self.observer_agent.generate_response(observer_event, memory, scores)

    def _skill_focus_for(self, memory: dict[str, Any], event: dict[str, Any]) -> str:
        event_type = str(event.get("event_type") or "")
        if event_type == "crisis_triggered":
            return "adaptability"
        if event_type in ("tests_failed", "tests_passed", "run_tests"):
            return "technical validation"
        if event_type == "submit_solution":
            return "ownership and handoff clarity"

        message_count = int(memory.get("user_message_count", 0))
        sequence = [
            "communication",
            "prioritization",
            "technical judgment",
            "validation",
            "tradeoff reasoning",
            "ownership",
        ]
        return sequence[min(message_count - 1, len(sequence) - 1)]

    def _select_agent_lineup(self, event: dict[str, Any], memory: dict[str, Any]) -> list[Any]:
        message = str(event.get("candidate_message") or "").lower()
        event_type = str(event.get("event_type") or "")
        task = event.get("task") or {}

        if event_type == "candidate_message" and not memory.get("candidate_introduced"):
            return [self.pm_agent]

        direct_agent = self._directly_addressed_agent(message)
        if direct_agent:
            return [direct_agent]

        if event.get("candidate_introduction_detected"):
            anchor = self._role_anchor_agent(task)
            return self._unique_agents([self.pm_agent, anchor])[:2]

        if event_type == "submit_solution":
            return self._unique_agents([self.pm_agent, self.qa_agent, self._role_anchor_agent(task)])[:3]

        if event_type in ("tests_failed", "tests_passed", "run_tests"):
            return self._unique_agents([self.qa_agent, self._technical_or_data_agent(task, message)])[:2]

        if event_type == "crisis_triggered":
            return self._crisis_lineup(task, message)

        ranked = self._rank_agents_for_event(event, memory)
        count = 1
        if self._asks_everyone(message) or self._asks_for_help(message) or self._needs_discussion(message):
            count = 2
        if self._pressure_level(task) == "advanced" and self._needs_discussion(message):
            count = 2

        if count > 1 and ranked:
            second = self._second_agent_for(ranked[0], message)
            if second and second.id != ranked[0].id:
                return self._unique_agents([ranked[0], second])[:count]

        return ranked[:count] or [self.pm_agent]

        if event_type == "submit_solution":
            return [self.pm_agent, self.qa_agent, self.backend_agent]

        if event_type in ("tests_failed", "tests_passed", "run_tests"):
            return [self.qa_agent, self.backend_agent]

        if event_type == "crisis_triggered":
            return [self.pm_agent, self.backend_agent, self.qa_agent]

        if event_type == "candidate_message" and not memory.get("candidate_introduced"):
            return [self.pm_agent]

        if event.get("candidate_introduction_detected"):
            return [self.pm_agent, self.backend_agent]

        direct_agent = self._directly_addressed_agent(message)
        if direct_agent:
            return [direct_agent]

        if self._asks_everyone(message):
            return [self.pm_agent, self.backend_agent, self.designer_agent, self.qa_agent]

        if self._asks_for_help(message):
            return [self.pm_agent, self.backend_agent, self.qa_agent]

        primary = self._select_primary_agent(event, memory)

        if self._needs_discussion(message):
            second = self._second_agent_for(primary, message)
            if second and second.id != primary.id:
                return [primary, second]

        return [primary]

    def _agent_pool(self) -> list[Any]:
        return [self.pm_agent, self.backend_agent, self.designer_agent, self.qa_agent, self.data_agent]

    def _rank_agents_for_event(self, event: dict[str, Any], memory: dict[str, Any]) -> list[Any]:
        task = event.get("task") or {}
        message = str(event.get("candidate_message") or "").lower()
        active_file = str(event.get("active_file") or "").lower()
        workspace_snapshot = str(event.get("workspace_snapshot") or "").lower()
        combined = " ".join([message, active_file, workspace_snapshot, str(task.get("title") or "").lower(), str(task.get("problem") or "").lower()])
        domain = task.get("domain") or self._task_domain(task)

        keyword_map = {
            self.backend_agent.id: (
                "api", "backend", "server", "database", "retry", "token", "endpoint", "error", "code",
                "patch", "prod", "cache", "timeout", "queue", "deploy", "log", "infra", "scaling", "worker",
            ),
            self.designer_agent.id: (
                "ui", "ux", "design", "screen", "copy", "mobile", "layout", "button", "banner", "message",
                "accessibility", "onboarding", "flow", "loading", "empty state",
            ),
            self.qa_agent.id: (
                "test", "bug", "fail", "edge", "qa", "rollback", "proof", "validate", "monitor", "repro",
                "regression", "safe", "checks", "risk",
            ),
            self.pm_agent.id: (
                "plan", "priority", "scope", "deadline", "ship", "customer", "decision", "start", "owner",
                "stakeholder", "launch", "cut", "tradeoff", "impact", "eta",
            ),
            self.data_agent.id: (
                "metric", "analytics", "data", "dashboard", "retention", "experiment", "sql", "cohort",
                "conversion", "kpi", "report", "forecast", "segment", "funnel", "csv",
            ),
        }
        domain_boost = {
            "backend": self.backend_agent.id,
            "frontend": self.designer_agent.id,
            "design": self.designer_agent.id,
            "data": self.data_agent.id,
            "pm": self.pm_agent.id,
        }

        scores: dict[str, int] = {}
        for agent in self._agent_pool():
            score = 0
            for token in keyword_map[agent.id]:
                if token in combined:
                    score += 3
            if domain_boost.get(domain) == agent.id:
                score += 4
            if agent.name == memory.get("last_agent"):
                score -= 2
            if agent.name in (memory.get("last_agents") or []):
                score -= 1
            scores[agent.id] = score

        if not any(score > 0 for score in scores.values()):
            scores[self.pm_agent.id] += 2
            scores[self._role_anchor_agent(task).id] += 1

        ranked = sorted(self._agent_pool(), key=lambda agent: scores.get(agent.id, 0), reverse=True)
        return self._unique_agents(ranked)

    def _role_anchor_agent(self, task: dict[str, Any]) -> Any:
        domain = task.get("domain") or self._task_domain(task)
        if domain == "backend":
            return self.backend_agent
        if domain in ("frontend", "design"):
            return self.designer_agent
        if domain == "data":
            return self.data_agent
        return self.pm_agent

    def _technical_or_data_agent(self, task: dict[str, Any], message: str) -> Any:
        combined = f"{message} {task.get('domain', '')}".lower()
        if any(token in combined for token in ("metric", "data", "analytics", "dashboard", "csv", "sql")):
            return self.data_agent
        if any(token in combined for token in ("ui", "ux", "screen", "copy", "accessibility")):
            return self.designer_agent
        return self.backend_agent

    def _crisis_lineup(self, task: dict[str, Any], message: str) -> list[Any]:
        anchor = self._role_anchor_agent(task)
        crisis_event = task.get("domain") or ""
        lineup = [self.pm_agent, anchor]
        if anchor.id == self.qa_agent.id:
            lineup.append(self.backend_agent)
        elif crisis_event == "data" or any(token in message for token in ("metric", "data", "dashboard")):
            lineup.append(self.data_agent)
        elif crisis_event in ("frontend", "design"):
            lineup.append(self.qa_agent)
        else:
            lineup.append(self.qa_agent)
        return self._unique_agents(lineup)[:3]

    def _unique_agents(self, agents: list[Any]) -> list[Any]:
        seen: set[str] = set()
        unique: list[Any] = []
        for agent in agents:
            if not agent or agent.id in seen:
                continue
            seen.add(agent.id)
            unique.append(agent)
        return unique

    def _pressure_level(self, task: dict[str, Any]) -> str:
        difficulty = str(task.get("difficulty") or "").lower()
        severity = str((task.get("room") or {}).get("severity") or "").lower()
        deadline = int(task.get("deadline") or 45)
        if "advanced" in difficulty or "critical" in difficulty or "high" in severity or deadline <= 30:
            return "advanced"
        if "beginner" in difficulty or "low" in difficulty:
            return "beginner"
        return "intermediate"

    def _select_primary_agent(self, event: dict[str, Any], memory: dict[str, Any]) -> Any:
        message = str(event.get("candidate_message") or "").lower()
        event_type = str(event.get("event_type") or "")

        direct_agent = self._directly_addressed_agent(message)
        if direct_agent:
            return direct_agent

        if event_type in ("tests_failed", "tests_passed", "run_tests"):
            return self.qa_agent

        if event_type == "submit_solution":
            return self.pm_agent

        if event_type == "crisis_triggered":
            return self.pm_agent

        if any(word in message for word in ("ui", "ux", "design", "screen", "copy", "mobile", "layout", "button", "banner", "message")):
            return self.designer_agent

        if any(word in message for word in ("api", "backend", "server", "database", "retry", "token", "endpoint", "error", "code", "patch", "prod")):
            return self.backend_agent

        if any(word in message for word in ("test", "bug", "fail", "edge", "qa", "rollback", "proof", "validate", "monitor")):
            return self.qa_agent

        if any(word in message for word in ("metric", "analytics", "data", "dashboard", "retention", "experiment", "sql", "cohort", "conversion", "kpi", "forecast")):
            return self.data_agent

        if any(word in message for word in ("plan", "priority", "scope", "deadline", "ship", "customer", "decision", "what should i do", "what to do", "start")):
            return self.pm_agent

        agents = [self.pm_agent, self.backend_agent, self.designer_agent, self.qa_agent, self.data_agent]
        last_agent = memory.get("last_agent")

        available = [
            agent for agent in agents
            if agent.name != last_agent
        ]

        return (available or agents)[0]

    def _directly_addressed_agent(self, message: str) -> Any | None:
        checks = {
            "mira": self.designer_agent,
            "@mira": self.designer_agent,
            "ravi": self.backend_agent,
            "@ravi": self.backend_agent,
            "kenji": self.qa_agent,
            "@kenji": self.qa_agent,
            "asha": self.pm_agent,
            "@asha": self.pm_agent,
            "leah": self.data_agent,
            "@leah": self.data_agent,
        }

        for name, agent in checks.items():
            if name in message:
                return agent

        return None

    def _asks_everyone(self, message: str) -> bool:
        return any(
            token in message
            for token in (
                "everyone",
                "all of you",
                "team",
                "what do you all think",
                "any thoughts",
                "anyone",
                "all tell",
            )
        )

    def _asks_for_help(self, message: str) -> bool:
        return any(
            token in message
            for token in (
                "what i should do",
                "what should i do",
                "what to do",
                "help me",
                "tell me what to do",
                "how to start",
                "where to start",
                "next step",
            )
        )

    def _needs_discussion(self, message: str) -> bool:
        return any(
            token in message
            for token in (
                "risk",
                "safe",
                "ship",
                "final",
                "demo",
                "production",
                "prod",
                "deadline",
                "blocked",
                "bug",
                "fails",
                "failed",
                "confusing",
                "tradeoff",
                "rollback",
                "patch",
                "customer",
                "urgent",
            )
        )

    def _second_agent_for(self, primary: Any, message: str) -> Any | None:
        if primary.id == self.backend_agent.id:
            if any(token in message for token in ("test", "bug", "fail", "risk", "safe", "rollback", "proof")):
                return self.qa_agent
            return self.pm_agent

        if primary.id == self.designer_agent.id:
            if any(token in message for token in ("api", "backend", "state", "loading", "error")):
                return self.backend_agent
            return self.pm_agent

        if primary.id == self.qa_agent.id:
            return self.backend_agent

        if primary.id == self.data_agent.id:
            if any(token in message for token in ("launch", "scope", "deadline", "customer", "decision")):
                return self.pm_agent
            return self.qa_agent

        if primary.id == self.pm_agent.id:
            if any(token in message for token in ("ui", "ux", "design", "screen", "copy", "banner", "message")):
                return self.designer_agent
            if any(token in message for token in ("api", "backend", "server", "retry", "patch", "code")):
                return self.backend_agent
            if any(token in message for token in ("metric", "analytics", "data", "dashboard", "retention", "experiment")):
                return self.data_agent
            return self.qa_agent

        return None

    def _safe_fallback_for(self, agent: Any, event: dict[str, Any]) -> str:
        message = str(event.get("candidate_message") or "").lower()
        greeting = any(word in message for word in ("hello", "hi", "hey"))
        needs_intro = bool(event.get("requires_candidate_intro"))

        if needs_intro:
            return "quick intro first, then we will move into the task"

        if agent.id == self.pm_agent.id:
            return "hey, start with the safest next step" if greeting else "pick the next step and keep scope small"

        if agent.id == self.backend_agent.id:
            return "hey, tell me what behavior to build" if greeting else "tell me exact backend behavior"

        if agent.id == self.designer_agent.id:
            return "hey, I can help with user clarity" if greeting else "make the user message clear and calm"

        if agent.id == self.qa_agent.id:
            return "hey, I’ll watch risky edge cases" if greeting else "name the risky case we should prove"

        if agent.id == self.data_agent.id:
            return "hey, I will keep the metric honest" if greeting else "name the metric and the caveat before we cite it"

        return "okay, keep going"

    def _resolve_phase(self, event: dict[str, Any], memory: dict[str, Any]) -> str:
        event_type = str(event.get("event_type") or "")

        if event_type == "simulation_start":
            return "intro"

        if event_type == "crisis_triggered":
            return "crisis"

        if event_type in ("tests_failed", "tests_passed"):
            return "validation"

        if event_type == "submit_solution":
            return "submitted"

        if not memory.get("candidate_introduced"):
            return "intro"

        if memory.get("candidate_plan_shared"):
            return "planning"

        if memory.get("asked_clarification"):
            return "discovery"

        return "discovery" if event.get("candidate_introduction_detected") else memory.get("phase") or "intro"

    def _timeline_event_for(
        self,
        event: dict[str, Any],
        messages: list[dict[str, Any]],
        candidate_message: str,
        task: dict[str, Any],
    ) -> dict[str, Any]:
        event_type = str(event.get("event_type") or "")

        if event_type == "submit_solution":
            title = "Final solution submitted"
            description = "Candidate handed off the final work."
        elif event_type == "tests_failed":
            title = "Tests failed"
            description = "Validation found issues."
        elif event_type == "tests_passed":
            title = "Tests passed"
            description = "Core checks passed."
        elif event_type == "crisis_triggered":
            title = "Crisis triggered"
            crisis = event.get("crisis_event") or {}
            description = crisis.get("message") if isinstance(crisis, dict) else "Room moved into incident mode."
        elif event.get("candidate_introduction_detected"):
            title = "Candidate introduced themself"
            description = "Candidate gave an intro and the room moved toward first decisions."
        elif messages:
            title = "Room updated"
            names = ", ".join(msg.get("speaker_name", "") for msg in messages if msg.get("speaker_name"))
            description = f"{names} replied."
        else:
            title = "Candidate message"
            description = "Candidate sent a message."

        return {
            "title": title,
            "description": description,
            "created_at": _utc_now(),
        }

    def _build_final_report(self, session: dict[str, Any]) -> dict[str, Any]:
        report = self.observer_agent.generate_report(session)
        scores = deepcopy(session["scores"])

        report["scores"] = scores
        report["rubric"] = scores
        report["overall_score"] = self._average_score(scores)
        report["observer_notes"] = list(session.get("observer_notes") or [])[-6:]
        report["timeline"] = deepcopy(session["memory"].get("timeline") or [])

        task = session["task"]
        report["task"] = {
            "title": task["title"],
            "role": task["role"],
            "company": task["company"],
            "duration": f"{task['deadline']} mins",
        }

        if not report.get("summary"):
            report["summary"] = self._simple_report_summary(scores)
        report["score_summary"] = self._simple_report_summary(scores)
        report["submitted_at"] = _utc_now()

        return report

    def _simple_report_summary(self, scores: dict[str, int]) -> str:
        overall = self._average_score(scores)

        if overall >= 80:
            return "Strong work simulation. Candidate showed clear ownership."
        if overall >= 65:
            return "Good attempt. Candidate needs clearer decisions."
        return "Needs improvement. Candidate should drive the room more."

    def _message_payload(
        self,
        profile: dict[str, Any],
        message: str | None = None,
        created_at: str | None = None,
    ) -> dict[str, Any]:
        payload = {
            "speaker_name": profile.get("name") or profile.get("speaker_name"),
            "speaker_title": profile.get("role") or profile.get("speaker_title"),
            "avatar": profile.get("avatar"),
            "role": "agent",
            "created_at": created_at or _utc_now(),
        }

        if message is None:
            payload["message"] = profile.get("message") or profile.get("content") or ""
        else:
            payload["message"] = message

        return payload

    def _profile_from_message(self, message: dict[str, Any]) -> dict[str, Any] | None:
        if not message:
            return None

        return {
            "name": message.get("speaker_name") or "",
            "role": message.get("speaker_title") or "",
            "avatar": message.get("avatar") or "",
        }

    def _recent_room_context(self, session: dict[str, Any]) -> list[str]:
        transcript = session.get("transcript") or []

        return [
            f"{entry.get('speaker_name', 'Room')}: {entry.get('message', '')}"
            for entry in transcript[-6:]
            if entry.get("message")
        ]

    def _shorten_agent_reply(self, text: str) -> str:
        text = str(text or "").strip()
        words = text.split()

        if len(words) > 40:
            return " ".join(words[:40]).rstrip(".,!") + "."

        return text

    def _shorten_user_message(self, text: str) -> str:
        text = str(text or "").strip()

        if len(text) > 350:
            return text[:347].rstrip() + "..."

        return text

    def _extract_candidate_name(self, message: str) -> str | None:
        cleaned = message.strip()
        if not cleaned:
            return None

        pattern = re.compile(
            r"(?:^|\b)(?:hi|hello|hey)?[\s,!.-]*(?:my name is|i am|i'm|this is)\s+([A-Za-z][A-Za-z .'-]{0,40})",
            re.IGNORECASE,
        )
        match = pattern.search(cleaned)
        if not match:
            return None

        name = re.split(r"[,.!;:]|\s+-\s+|\s+and\s+|\s+with\s+|\s+from\s+", match.group(1).strip(), maxsplit=1)[0]
        words = [word.strip(" .'\"") for word in name.split() if word.strip(" .'\"")]
        if not words:
            return None

        if words[0].lower() in {"a", "an", "the", "backend", "frontend", "fullstack", "full", "product", "qa"}:
            return None

        return " ".join(words[:2]).title()

    def _candidate_intro_like(self, message: str) -> bool:
        lowered = message.lower().strip()
        if not lowered:
            return False

        intro_markers = (
            "my name is",
            "i am",
            "i'm",
            "this is",
            "i work as",
            "i usually",
            "my background",
            "my role",
        )
        role_markers = (
            "engineer",
            "developer",
            "designer",
            "product manager",
            "qa",
            "student",
            "candidate",
            "backend",
            "frontend",
            "full stack",
            "fullstack",
            "data",
            "devops",
        )

        return any(marker in lowered for marker in intro_markers) and any(marker in lowered for marker in role_markers)

    def _average_score(self, scores: dict[str, int]) -> int:
        values = [int(value) for value in scores.values()]
        return round(sum(values) / len(values)) if values else 0

    def _bump(self, scores: dict[str, int], key: str, amount: int) -> None:
        current = int(scores.get(key, 50))
        scores[key] = max(0, min(100, current + amount))


ORCHESTRATOR = SimulationOrchestrator()


def start_simulation(
    task_id: str | None = None,
    role: str | None = None,
    participant_name: str | None = None,
    task_context: dict[str, Any] | None = None,
) -> dict[str, Any]:
    return ORCHESTRATOR.start_simulation(
        task_id=task_id,
        role=role,
        participant_name=participant_name,
        task_context=task_context,
    )


def get_session(session_id: str) -> dict[str, Any] | None:
    return ORCHESTRATOR.get_session(session_id)


def handle_agent_event(event: dict[str, Any]) -> dict[str, Any]:
    return ORCHESTRATOR.handle_event(event)


def evaluate_work(submission: str, role: str) -> dict[str, Any]:
    return ORCHESTRATOR.evaluate_work(
        submission=submission,
        role=role,
    )


def run_simulation(user_input: str) -> dict[str, str]:
    return ORCHESTRATOR.run_simulation(user_input)
