from __future__ import annotations

import re
import logging
from copy import deepcopy
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from ai_engine.agents import BackendAgent, DataAnalystAgent, DesignerAgent, ObserverAgent, PMAgent, QAAgent

logger = logging.getLogger(__name__)


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
    "phase": "planning",
    "last_agent": None,
    "last_agents": [],
    "decisions": [],
    "blockers": [],
    "unresolved_risks": [],
    "referenced_files": [],
    "crisis_events": [],
    "crisis_count": 0,
    "current_crisis": None,
    "dynamic_triggers_seen": [],
    "candidate_name": "",
    "user_message_count": 0,
    "agent_reply_count": 0,
    "last_question_reply_count": -10,
    "candidate_stop_questions": False,
    "recent_agent_replies": [],
    "simulation_done": False,
}

DEFAULT_SCORES = {
    "leadership": 0,
    "communication": 0,
    "ownership": 0,
    "prioritization": 0,
    "adaptability": 0,
    "technicalDepth": 0,
}


TASKS = {
    "login-recovery": {
        "company": "Acme Corp",
        "channel": "login-recovery",
        "role": "Backend Engineer",
        "title": "Login Recovery Incident",
        "deadline": 15,
        "difficulty": "High Pressure",
        "problem": "Login retries are locking out valid users before a customer review. The team must stabilize the flow without widening scope.",
        "crisis": "Support tickets spike after the retry change. Leadership wants a safe ship/rollback call now.",
        "requirements": [
            "Identify smallest safe backend fix",
            "Define rollback trigger",
            "Protect login stability",
            "Write customer-safe update",
        ],
        "files": ["auth/sessionGuard.js", "auth/rateLimit.js", "support/login_ticket_dump.txt"],
        "starter_code": """// Acme Corp login recovery
const attempts = {};

function allowRequest(userId, ip) {
  attempts[ip] = (attempts[ip] || 0) + 1;
  return true; // FIXME: valid users can retry into a bad lockout state
}

function audit(event) {
  console.log(event); // FIXME: not enough evidence for QA review
}
""",
    },

    "mobile-growth": {
        "company": "Northstar Pay",
        "channel": "growth-lab",
        "role": "Product Manager",
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
        "role": "Product Designer",
        "title": "Clarify API Error Recovery UX",
        "deadline": 45,
        "difficulty": "Low Pressure",
        "problem": "Recent API errors are confusing users and support needs a clearer recovery flow before the next release.",
        "crisis": "A customer integration broke because the recovery copy still points users to the wrong next step.",
        "requirements": [
            "Clarify the user-facing recovery state",
            "Document handoff notes for engineering",
            "Flag confusing copy",
            "Write support-safe release note",
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

    "qa-release": {
        "company": "Beacon",
        "channel": "release-gate",
        "role": "QA Engineer",
        "title": "Investigate a Release Blocker",
        "deadline": 45,
        "difficulty": "High Pressure",
        "problem": "A same-day release has inconsistent recovery behavior. QA needs to isolate the risky path and decide whether to ship, hold, or narrow scope.",
        "crisis": "Support tickets rise while the team is still validating the fix. Leadership wants the QA signoff call now.",
        "requirements": [
            "Reproduce the riskiest failure path",
            "Name release-blocking evidence",
            "Define retest coverage",
            "Communicate ship or hold clearly",
        ],
        "files": ["qa/release_blocker.md", "logs/recovery_repro.txt", "support/ticket_dump.txt"],
        "starter_code": """# QA release blocker

Known issue:
- Recovery behavior is inconsistent after retry.

Open checks:
- Happy path
- Slow network path
- Failed retry path
- Rollback communication
""",
    },

    "fraud-dashboard": {
        "company": "Stripe",
        "channel": "fraud-detection",
        "role": "Data Analyst",
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

    "search-quality": {
        "company": "Google",
        "channel": "search-quality",
        "role": "Data Analyst",
        "title": "Search Quality Recovery Sprint",
        "deadline": 5 * 24 * 60,
        "difficulty": "Premium Sprint",
        "problem": "Search conversion dropped after a ranking update. The team must balance relevance, latency, and customer complaints without overcorrecting.",
        "crisis": "Support tickets spike after the ranking change. Leadership asks for a clear recovery call in 30 minutes.",
        "requirements": [
            "Identify the broken ranking signal",
            "Propose the smallest safe adjustment",
            "Define validation and rollback criteria",
            "Protect search quality",
        ],
        "files": ["search/rankingSignals.js", "metrics/search_quality.csv", "support/ranking_complaints.md"],
        "starter_code": """// Search quality recovery

function scoreResult(result, userContext) {
  return result.keywordMatch; // FIXME: ignores quality, recency, and complaints
}
""",
    },

    "ai-copilot": {
        "company": "Microsoft",
        "channel": "copilot-integration",
        "role": "Frontend Engineer",
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
        "role": "Data Analyst",
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
        "files": ["pricing/surgeEngine.js", "backend/priceCache.js", "api/pricingRoute.js"],
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
        "problem": "Encoding latency is too high. The team needs better job assignment and retry behavior.",
        "crisis": "A new release causes encoding queue backlog before regional launch.",
        "requirements": [
            "Reduce queue latency",
            "Add worker retry logic",
            "Prevent duplicate encoding",
            "Track job status",
        ],
        "files": ["encoding/jobQueue.js", "workers/encoderWorker.js", "reports/jobStatus.js"],
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
        "role": "Data Analyst",
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
        "role": "Frontend Engineer",
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
            "description": f"{task['company']} opened {task['title'].lower()} with the active task files loaded.",
            "created_at": _utc_now(),
        }
        memory["timeline"].append(timeline_event)
        memory["team_introduced"] = True

        initial_messages = self._initial_messages_for(task, memory, scores)
        transcript = [
            self._message_payload(entry, created_at=_utc_now())
            for entry in initial_messages
        ]
        logger.info(
            "simulation_start session=%s task=%s phase=%s opening_agents=%s",
            session_id,
            task.get("title"),
            memory["phase"],
            ",".join(entry.get("name", "") for entry in initial_messages),
        )

        observer_note = "Room opened with task-specific team context and active workspace files."

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
            "phase": session["memory"].get("phase", "planning"),
            "simulation_done": session["memory"].get("simulation_done", False),
        }

    def handle_event(self, event: dict[str, Any]) -> dict[str, Any]:
        event = deepcopy(event)
        session = self._resolve_session(event)

        memory = session["memory"]
        scores = session["scores"]
        task = session["task"]

        task = self._refresh_task_from_event(task, event)
        session["task"] = task

        normalized_type = self._normalize_event_type(event)
        event["event_type"] = normalized_type
        event["task"] = task
        mode = self._normalize_chat_mode(event)
        requested_agent = event.get("agentId") or event.get("agent_id") or event.get("target_agent_id")
        channel_id = self._channel_for_event(event, task, mode, requested_agent)
        event["mode"] = mode
        event["channel_id"] = channel_id
        event["target_agent_id"] = self._target_agent_id_from_channel(channel_id, requested_agent)

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
                    "channel": channel_id,
                }
            )

        self._update_memory(memory, event)
        self._update_scores(scores, event)

        recent_room_context = self._recent_room_context(session)

        if normalized_type == "crisis_triggered":
            memory["crisis_already_triggered"] = True
            crisis_trigger = event.get("crisis_trigger") or event.get("crisis_reason") or event.get("trigger")
            crisis_event = self._next_crisis_event(task, memory, crisis_trigger)
            event["crisis_event"] = crisis_event
            memory["current_crisis"] = crisis_event
            self._remember(memory, "crisis_events", crisis_event.get("message") or task.get("crisis"))
            if crisis_trigger:
                self._remember(memory, "dynamic_triggers_seen", crisis_trigger)

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

        visible_transcript = self._messages_for_mode(session["transcript"], event, task)

        return {
            "session_id": session["id"],
            "agent": self._profile_from_message(primary_message),
            "message": primary_message.get("message") or "",
            "new_messages": deepcopy(new_messages),
            "messages": deepcopy(visible_transcript),
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

        if any(token in role_text for token in ("qa", "quality", "tester", "testing")):
            return self._task_payload("qa-release", task_context=task_context)

        if any(token in role_text for token in ("backend", "api", "server", "database", "sql")):
            return self._task_payload("login-recovery", task_context=task_context)

        if any(token in role_text for token in ("frontend", "web", "react", "html", "css", "js", "client", "interface")):
            return self._task_payload("vr-marketplace", task_context=task_context)

        if any(token in role_text for token in ("product", "growth", "mobile")):
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
        task["title"] = str(context.get("title") or context.get("taskTitle") or task.get("title"))
        task["role"] = str(context.get("role") or task.get("role"))
        candidate_role = context.get("candidateRole") or context.get("candidate_role") or context.get("participant_role") or context.get("userRole")
        if candidate_role:
            task["candidate_role"] = str(candidate_role)
        task["problem"] = str(context.get("description") or context.get("summary") or context.get("scenario") or task.get("problem"))
        task["difficulty"] = str(context.get("difficulty") or task.get("difficulty"))
        task["channel"] = self._slugify(context.get("label") or context.get("title") or context.get("taskTitle") or task.get("channel"))
        if context.get("crisis"):
            task["crisis"] = str(context.get("crisis"))

        skills = context.get("skills")
        if isinstance(skills, list) and skills:
            task["requirements"] = [str(skill) for skill in skills if str(skill).strip()]

        workspace_files = context.get("workspaceFiles") or context.get("workspace_files") or context.get("files")
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

    def _refresh_task_from_event(self, task: dict[str, Any], event: dict[str, Any]) -> dict[str, Any]:
        refreshed = deepcopy(task)
        current_task = event.get("current_task") or event.get("currentTask")
        task_context = event.get("task_context")

        if isinstance(task_context, dict):
            refreshed = self._apply_task_context(refreshed, task_context)
        if isinstance(current_task, dict):
            refreshed = self._apply_task_context(refreshed, current_task)

        workspace_files = event.get("workspace_files") or event.get("workspaceFiles")
        if isinstance(workspace_files, list) and workspace_files:
            file_names: list[str] = []
            rich_files: list[dict[str, str]] = []
            for item in workspace_files:
                if isinstance(item, dict):
                    name = str(item.get("path") or item.get("name") or "").strip()
                    content = str(item.get("content") or "")
                    kind = str(item.get("kind") or item.get("type") or self._file_kind(name))
                    language = str(item.get("language") or "")
                    if name:
                        file_names.append(name)
                        rich_files.append({
                            "path": name,
                            "name": name,
                            "kind": kind,
                            "language": language,
                            "content": content[:1200],
                            "signal": self._file_signal(name, refreshed.get("domain") or self._task_domain(refreshed)),
                        })
                else:
                    name = str(item or "").strip()
                    if name:
                        file_names.append(name)
                        rich_files.append({
                            "path": name,
                            "name": name,
                            "kind": self._file_kind(name),
                            "signal": self._file_signal(name, refreshed.get("domain") or self._task_domain(refreshed)),
                        })

            if file_names:
                refreshed["files"] = file_names
                refreshed["workspace_files"] = rich_files

        return self._enrich_task_payload(refreshed)

    def _enrich_task_payload(self, task: dict[str, Any]) -> dict[str, Any]:
        domain = self._task_domain(task)
        task["domain"] = domain
        if not task.get("workspace_files"):
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
        focus_file = self._first_workspace_file(task)
        base = [
            {
                "trigger": "manual-crisis",
                "severity": "high",
                "message": task.get("crisis") or f"{company} escalation just landed in the room.",
                "impact": "The team needs a tighter decision and a visible owner.",
            },
            {
                "trigger": "metrics-worsened",
                "severity": "critical",
                "message": f"Live metrics just moved against us. {company} is seeing more failures while the room is still deciding.",
                "impact": "The next response must narrow scope, name the customer impact, and avoid overbuilding.",
            },
            {
                "trigger": "leadership-eta",
                "severity": "high",
                "message": "Leadership is asking for an ETA before the next stakeholder update.",
                "impact": "The room needs a clear owner, validation gate, and fallback if the first fix is not safe.",
            },
            {
                "trigger": "hidden-issue",
                "severity": "high",
                "message": f"QA found a second failure path tied to {focus_file}.",
                "impact": "The candidate should respond without losing the first priority.",
            },
            {
                "trigger": "draft-80",
                "severity": "medium",
                "message": f"The workspace draft is now detailed enough to challenge against {focus_file}.",
                "impact": "The room should test the riskiest assumption before polishing the handoff.",
            },
        ]
        if domain == "data":
            base.append(
                {
                    "trigger": "evidence-conflict",
                    "severity": "high",
                    "message": "Leadership is quoting a dashboard number that may be stale.",
                    "impact": "Data needs one trusted metric and one caveat before the update.",
                }
            )
        elif domain == "design":
            base.append(
                {
                    "trigger": "support-spike",
                    "severity": "high",
                    "message": "Support says users are confused by the recovery path.",
                    "impact": "The user-facing state needs clearer copy before rollout.",
                }
            )
        else:
            base.append(
                {
                    "trigger": "region-spread",
                    "severity": "high",
                    "message": "A second region is reporting the same symptom.",
                    "impact": "QA and engineering need proof that the fix is not local-only.",
                }
            )
        return base

    def _next_crisis_event(self, task: dict[str, Any], memory: dict[str, Any], trigger: Any = None) -> dict[str, str]:
        events = task.get("crisis_events") or self._crisis_events_for(task, task.get("domain") or self._task_domain(task))
        if not events:
            return {
                "severity": "high",
                "message": task.get("crisis") or "The room pressure increased.",
                "impact": "The next response needs a clearer decision.",
            }
        normalized_trigger = str(trigger or "").strip().lower()
        if normalized_trigger:
            for event in events:
                if str(event.get("trigger") or "").strip().lower() == normalized_trigger:
                    return deepcopy(event)
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
        if any(token in role for token in ("backend", "api", "server")):
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
        if any(token in combined for token in ("api", "backend", "database", "cache", "queue", "scaling", "worker", "service")):
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

    def _initial_messages_for(
        self,
        task: dict[str, Any],
        memory: dict[str, Any],
        scores: dict[str, int],
    ) -> list[dict[str, Any]]:
        anchor = self._role_anchor_agent(task)
        visible_pool = self._agent_pool(task)
        lead = self.pm_agent if self._agent_visible_for_task(self.pm_agent, task) else (visible_pool[0] if visible_pool else anchor)
        lineup = [
            agent
            for agent in self._unique_agents([lead, anchor] + visible_pool)
            if self._agent_visible_for_task(agent, task)
        ][:2]
        event = {
            "event_type": "simulation_start",
            "task": task,
            "candidate_message": "",
            "current_task": {
                "taskTitle": task.get("title"),
                "company": task.get("company"),
                "role": task.get("role"),
                "scenario": task.get("problem"),
                "skills": task.get("requirements") or [],
                "files": task.get("files") or [],
            },
            "channel_id": "team",
            "room_pressure": self._pressure_level(task),
            "observer_notes_summary": "Room opened; no candidate behavior yet.",
            "question_allowed": False,
        }

        messages = []
        rolling_context: list[str] = []
        for index, agent in enumerate(lineup):
            agent_event = {
                **event,
                "room_context": rolling_context[-4:],
                "speaker_position": index + 1,
                "team_lineup": [teammate.name for teammate in lineup],
                "previous_agent_reply": messages[-1]["message"] if messages else "",
            }
            reply = agent.generate_response(agent_event, memory, scores)
            if not reply:
                reply = self._safe_fallback_for(agent, agent_event, memory)
            reply = self._sanitize_file_references(reply, task)
            if self._reply_has_question(reply):
                reply = self._remove_questions(reply) or self._safe_fallback_for(agent, agent_event, memory)
            if self._looks_incomplete_reply(reply):
                reply = self._safe_fallback_for(agent, agent_event, memory)
            message = {
                "name": agent.name,
                "role": agent.role,
                "avatar": agent.avatar,
                "message": self._shorten_agent_reply(reply),
            }
            messages.append(message)
            rolling_context.append(f"{agent.name}: {message['message']}")

        unique: list[dict[str, Any]] = []
        seen: set[str] = set()
        for message in messages[:2]:
            name = str(message.get("name") or "")
            if name in seen:
                continue
            seen.add(name)
            unique.append(message)
        return unique

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

        if any(
            token in message
            for token in (
                "stop asking questions",
                "don't ask questions",
                "dont ask questions",
                "no more questions",
                "stop questioning",
            )
        ):
            memory["candidate_stop_questions"] = True

        if memory["user_message_count"] >= 12:
            memory["simulation_done"] = True

        extracted_name = self._extract_candidate_name(original_message)
        if extracted_name:
            memory["candidate_name"] = extracted_name

        if original_message and (extracted_name or self._candidate_intro_like(original_message)):
            memory["candidate_introduced"] = True

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
        if not message.strip():
            return

        words = re.findall(r"[a-z0-9_]+", message)
        greeting_only = bool(re.fullmatch(r"(hi+|hello+|hey+|yo+|sup)[!. ]*", message.strip()))
        if greeting_only or len(words) <= 2:
            self._bump(scores, "communication", 6)
            return

        if any(token in message for token in ("plan", "first", "then", "priority")):
            self._bump(scores, "leadership", 8)
            self._bump(scores, "communication", 5)

        if any(token in message for token in ("clarify", "why", "what exactly", "what does")):
            self._bump(scores, "communication", 6)
            self._bump(scores, "technicalDepth", 3)

        if any(token in message for token in ("tradeoff", "cut", "focus", "deadline", "scope")):
            self._bump(scores, "prioritization", 8)
            self._bump(scores, "leadership", 4)

        decision_signal = any(token in message for token in ("decision", "we should", "i will", "i'll", "ship", "hold", "prioritize", "first"))
        tradeoff_signal = any(token in message for token in ("tradeoff", "cut", "defer", "scope", "instead", "not ship", "leave out"))
        evidence_signal = any(token in message for token in ("because", "evidence", "metric", "data", "trend", "log", "ticket", "customer", "support"))
        validation_signal = any(token in message for token in ("test", "validate", "validation", "retest", "proof", "edge", "rollback", "monitor"))
        ownership_signal = any(token in message for token in ("owner", "handoff", "next step", "eta", "i will", "i'll", "assign"))
        technical_signal = any(token in message for token in ("api", "backend", "retry", "payload", "database", "cache", "queue", "mobile safari", "contract"))

        if decision_signal:
            self._bump(scores, "leadership", 12)
            self._bump(scores, "prioritization", 12)
            self._bump(scores, "communication", 8)
        if tradeoff_signal:
            self._bump(scores, "prioritization", 14)
            self._bump(scores, "adaptability", 8)
        if evidence_signal:
            self._bump(scores, "communication", 8)
            self._bump(scores, "ownership", 8)
        if validation_signal:
            self._bump(scores, "ownership", 16)
            self._bump(scores, "technicalDepth", 12)
        if ownership_signal:
            self._bump(scores, "ownership", 14)
            self._bump(scores, "leadership", 8)
        if technical_signal:
            self._bump(scores, "technicalDepth", 12)

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
        question_used_this_turn = False
        observer_notes_summary = self._observer_notes_summary(session)
        logger.info(
            "orchestrator_lineup session=%s event=%s channel=%s agents=%s candidate=%s",
            session.get("id", ""),
            event.get("event_type"),
            event.get("channel_id") or "team",
            ",".join(agent.id for agent in lineup),
            self._shorten_user_message(event.get("candidate_message") or ""),
        )

        for index, agent in enumerate(lineup):
            question_allowed = self._question_allowed(memory, event, index) and not question_used_this_turn
            agent_event = {
                **event,
                "room_context": rolling_context[-5:],
                "candidate_name": memory.get("candidate_name") or session.get("participant_name") or "",
                "skill_focus": memory.get("skill_focus") or event.get("skill_focus"),
                "question_allowed": question_allowed,
                "speaker_position": index + 1,
                "team_lineup": [teammate.name for teammate in lineup],
                "previous_agent_reply": generated[-1]["message"] if generated else "",
                "room_pressure": self._pressure_level(session["task"]),
                "channel_id": event.get("channel_id") or "team",
                "target_agent_id": event.get("target_agent_id"),
            }

            agent_event["observer_notes_summary"] = observer_notes_summary
            reply = agent.generate_response(agent_event, memory, scores)

            if not reply:
                reply = self._safe_fallback_for(agent, event, memory)

            reply = self._sanitize_file_references(reply, session["task"])
            if self._reply_has_question(reply):
                if question_allowed:
                    question_used_this_turn = True
                    memory["last_question_reply_count"] = int(memory.get("agent_reply_count", 0))
                else:
                    logger.info("agent_reply_repaired reason=question agent=%s", agent.id)
                    reply = self._remove_questions(reply) or self._safe_fallback_for(agent, event, memory)

            if self._is_repetitive_reply(reply, memory):
                logger.info("agent_reply_repaired reason=repetitive agent=%s", agent.id)
                reply = self._safe_fallback_for(agent, event, memory)

            if self._looks_incomplete_reply(reply):
                logger.info("agent_reply_repaired reason=incomplete agent=%s original=%s", agent.id, reply)
                reply = self._safe_fallback_for(agent, event, memory)

            reply = self._sanitize_file_references(reply, session["task"])
            payload = self._message_payload(
                agent.profile(),
                self._shorten_agent_reply(reply),
                channel=event.get("channel_id") or "team",
            )
            logger.info(
                "orchestrator_message agent=%s channel=%s chars=%s message=%s",
                agent.id,
                payload.get("channel"),
                len(payload.get("message") or ""),
                payload.get("message"),
            )
            generated.append(payload)
            rolling_context.append(f"{payload['speaker_name']}: {payload['message']}")
            memory["agent_reply_count"] = int(memory.get("agent_reply_count", 0)) + 1
            self._remember_agent_reply(memory, payload["message"])

        return generated

    def _question_allowed(self, memory: dict[str, Any], event: dict[str, Any], speaker_index: int) -> bool:
        if memory.get("candidate_stop_questions"):
            return False
        if speaker_index > 0:
            return False

        event_type = str(event.get("event_type") or "")
        if event_type in ("crisis_triggered", "tests_failed", "tests_passed", "run_tests", "submit_solution"):
            return False

        message = str(event.get("candidate_message") or "").lower()
        if self._asks_for_help(message):
            return False

        reply_count = int(memory.get("agent_reply_count", 0))
        last_question = int(memory.get("last_question_reply_count", -10))
        return reply_count - last_question >= 3

    def _reply_has_question(self, text: str) -> bool:
        return "?" in str(text or "")

    def _should_use_guardrail_reply(self, event: dict[str, Any]) -> bool:
        raw_message = str(event.get("candidate_message") or "").strip()
        if not raw_message:
            return False

        message = raw_message.lower()
        words = re.findall(r"[a-z0-9_]+", message)
        greeting = bool(re.fullmatch(r"(hi+|hello+|hey+|yo+|sup)[!. ]*", message))
        app_complaint = any(token in message for token in ("hardcode", "hardcoded", "nonsense", "same reply", "repeating"))
        low_signal = len(words) <= 2 and not self._asks_for_help(message)
        return greeting or app_complaint or low_signal

    def _looks_incomplete_reply(self, text: str) -> bool:
        cleaned = re.sub(r"\s+", " ", str(text or "").strip())
        if not cleaned:
            return True

        lowered = cleaned.lower().rstrip()
        if not lowered.endswith((".", "!", "?")):
            return True

        tail = lowered.rstrip(".!?").split()[-3:]
        if not tail:
            return True

        weak_endings = {
            "a",
            "an",
            "the",
            "to",
            "for",
            "from",
            "with",
            "without",
            "and",
            "or",
            "but",
            "of",
            "in",
            "on",
            "at",
            "by",
            "around",
            "because",
            "why",
            "what",
            "which",
        }
        if tail[-1] in weak_endings:
            return True

        incomplete_phrases = (
            "not making the",
            "because the",
            "so the",
            "around the",
            "tied to the",
            "need to figure out why",
        )
        return any(lowered.rstrip(".!?").endswith(phrase) for phrase in incomplete_phrases)

    def _remove_questions(self, text: str) -> str:
        sentences = re.split(r"(?<=[.!?])\s+", str(text or "").strip())
        kept = [sentence.strip() for sentence in sentences if sentence.strip() and "?" not in sentence]
        if kept:
            return " ".join(kept)

        cleaned = str(text or "").replace("?", ".").strip()
        lowered = cleaned.lower()
        question_starts = (
            "what ",
            "why ",
            "how ",
            "who ",
            "when ",
            "where ",
            "which ",
            "can you ",
            "could you ",
            "would you ",
            "do you ",
            "does ",
            "is ",
            "are ",
        )
        if any(lowered.startswith(prefix) for prefix in question_starts):
            return ""
        return cleaned

    def _reply_signature(self, text: str) -> str:
        return re.sub(r"[^a-z0-9]+", " ", str(text or "").lower()).strip()

    def _is_repetitive_reply(self, reply: str, memory: dict[str, Any]) -> bool:
        signature = self._reply_signature(reply)
        if not signature:
            return False

        current_tokens = set(signature.split())
        for previous in memory.get("recent_agent_replies") or []:
            previous_signature = self._reply_signature(previous)
            if not previous_signature:
                continue
            if previous_signature == signature:
                return True
            previous_tokens = set(previous_signature.split())
            if len(current_tokens) < 5 or len(previous_tokens) < 5:
                continue
            overlap = len(current_tokens & previous_tokens) / max(1, len(current_tokens | previous_tokens))
            if overlap >= 0.82:
                return True
        return False

    def _remember_agent_reply(self, memory: dict[str, Any], reply: str, limit: int = 8) -> None:
        replies = list(memory.get("recent_agent_replies") or [])
        replies.append(str(reply or "").strip())
        memory["recent_agent_replies"] = replies[-limit:]

    def _contextual_nudge_for(
        self,
        agent: Any,
        event: dict[str, Any],
        task: dict[str, Any],
        memory: dict[str, Any] | None = None,
    ) -> str:
        memory = memory or {}
        raw_message = str(event.get("candidate_message") or "").strip()
        message = raw_message.lower()
        words = re.findall(r"[a-z0-9_]+", message)
        focus_file = self._first_workspace_file(task)
        requirement = (task.get("requirements") or ["the main task"])[0]
        task_title = task.get("title") or "this task"
        turn = max(0, int(memory.get("user_message_count", 0)) - 1)
        greeting = bool(re.fullmatch(r"(hi+|hello+|hey+|yo+|sup)[!. ]*", message))
        low_signal = bool(raw_message) and len(words) <= 2 and not greeting
        app_complaint = any(token in message for token in ("hardcode", "hardcoded", "backend", "nonsense", "same reply", "repeating"))

        if app_complaint:
            return (
                "You are right to call out a canned reply. I will stay tied to the active task now: "
                f"use {focus_file}, name the real blocker, and I will respond to that exact detail."
            )

        if greeting:
            if agent.id == self.pm_agent.id:
                options = [
                    f"Hey, I am here. For {task_title}, start by naming the first decision and what you are deliberately leaving out.",
                    f"Still here. Move {task_title} forward with one owner, one next step, and one proof point.",
                    f"Quick reset: use {focus_file}, make the first call around {requirement}, and skip anything that does not change the outcome.",
                ]
                return options[turn % len(options)]
            if agent.id == self.backend_agent.id:
                options = [
                    f"Hey. If you want the technical path, start in {focus_file} and call out the failure mode you want protected.",
                    f"Still here. Give me the request, response, or error path in {focus_file}, and I will help narrow the contract.",
                    f"For engineering, the useful next move is to name the broken behavior and the fallback we expect.",
                ]
                return options[turn % len(options)]
            if agent.id == self.designer_agent.id:
                options = [
                    f"Hey. I can help make the user-facing state in {focus_file} clearer and less surprising.",
                    "Still here. Give me the confusing user moment and I will make the copy or state sharper.",
                    f"For design, the next useful move is showing what the user sees when {requirement} fails.",
                ]
                return options[turn % len(options)]
            if agent.id == self.qa_agent.id:
                options = [
                    "Hey. I will be useful once we name the risky path and the check that proves it.",
                    "Still here. Give me the edge case or test result, and I will tell you whether it is shippable.",
                    f"For QA, the useful next move is proving {requirement} on one normal path and one ugly path.",
                ]
                return options[turn % len(options)]
            if agent.id == self.data_agent.id:
                options = [
                    f"Hey. I can help pick the one signal that proves {requirement} is improving.",
                    "Still here. Give me the metric you trust and the caveat, and I will keep us honest.",
                    f"For data, the next useful move is choosing one signal tied to {task_title}, not five weak ones.",
                ]
                return options[turn % len(options)]

        if low_signal:
            return (
                "I cannot turn that into a useful room update yet. "
                "Give me one concrete file, blocker, decision, or test result and I will react to that."
            )

        if agent.id == self.pm_agent.id:
            if self._asks_for_help(message):
                return f"Start with {focus_file}. Make the first decision around {requirement}, then write what waits."
            options = [
                f"For {task_title}, make one clear call: what ships now, what waits, and why.",
                f"Anchor the next update in {focus_file}; the first move should protect {requirement}.",
                "Give the room a usable handoff: owner, next action, and the proof we will check.",
            ]
            return options[turn % len(options)]

        if agent.id == self.backend_agent.id:
            options = [
                f"From engineering, start in {focus_file} and separate success, failure, retry, and rollback behavior.",
                f"The risky bit is the contract around {requirement}; write the expected behavior before changing more.",
                "If the backend is involved, give me the exact request, response, and failure state so I can judge the contract.",
            ]
            return options[turn % len(options)]

        if agent.id == self.designer_agent.id:
            options = [
                f"In {focus_file}, make the user state obvious: what happened, what is safe, and what comes next.",
                "The user-facing copy should remove ambiguity, not add another decision for the user.",
                f"If {requirement} affects the UI, show the calm state, the error state, and the recovery action.",
            ]
            return options[turn % len(options)]

        if agent.id == self.qa_agent.id:
            options = [
                f"I will cover {focus_file} with the messiest path first: bad input, slow network, and rollback.",
                f"Before signoff, prove {requirement} with one happy path and one ugly edge case.",
                "Give me the exact check you ran; otherwise this still feels like a guess.",
            ]
            return options[turn % len(options)]

        if agent.id == self.data_agent.id:
            options = [
                f"From data, keep one trusted signal tied to {focus_file}, then say the caveat.",
                f"For {requirement}, pick one metric that proves direction and one reason it might lie.",
                "Do not overclaim the result; give the signal, the window, and the limitation.",
            ]
            return options[turn % len(options)]

        return f"Keep this tied to {focus_file} and move the task one concrete step forward."

    def _observer_note_for(
        self,
        event: dict[str, Any],
        memory: dict[str, Any],
        scores: dict[str, int],
        room_context: list[str],
    ) -> str:
        event_type = str(event.get("event_type") or "")
        should_observe = event_type in ("crisis_triggered", "tests_failed", "tests_passed", "submit_solution")
        should_observe = should_observe or bool(event.get("plan_signal_detected"))
        should_observe = should_observe or bool(event.get("clarification_signal_detected"))
        should_observe = should_observe or bool(event.get("tradeoff_signal_detected"))
        should_observe = should_observe or bool(memory.get("simulation_done"))

        if not should_observe:
            return ""

        return self.observer_agent.generate_response({**event, "room_context": room_context}, memory, scores)

    def _observer_notes_summary(self, session: dict[str, Any]) -> str:
        notes = [str(note).strip() for note in session.get("observer_notes") or [] if str(note).strip()]
        if not notes:
            return ""
        return " | ".join(notes[-3:])[:700]

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
        target_agent = self._agent_by_id(event.get("target_agent_id"))

        if target_agent and self._agent_visible_for_task(target_agent, task):
            return [target_agent]

        direct_agent = self._directly_addressed_agent(message)
        if direct_agent and self._agent_visible_for_task(direct_agent, task):
            return [direct_agent]

        if any(token in message for token in ("score", "scoring", "report", "rubric", "submission", "feedback", "skillrecord", "evaluation", "grade")):
            return [self.data_agent] if self._agent_visible_for_task(self.data_agent, task) else [self.pm_agent if self._agent_visible_for_task(self.pm_agent, task) else self._role_anchor_agent(task)]

        if event_type == "submit_solution":
            return [self.pm_agent] if self._agent_visible_for_task(self.pm_agent, task) else [self._role_anchor_agent(task)]

        if event_type in ("tests_failed", "tests_passed", "run_tests"):
            lineup = [self.qa_agent, self._technical_or_data_agent(task, message)]
            visible = [agent for agent in self._unique_agents(lineup) if self._agent_visible_for_task(agent, task)]
            return (visible or [self._role_anchor_agent(task)])[:2]

        if event_type == "crisis_triggered":
            return self._crisis_lineup(task, message)

        ranked = self._rank_agents_for_event(event, memory)
        count = 1
        if self._asks_everyone(message) or self._needs_discussion(message):
            count = 2
        if self._pressure_level(task) == "advanced" and self._needs_discussion(message):
            count = 2

        if count > 1 and ranked:
            second = self._second_agent_for(ranked[0], message)
            if second and second.id != ranked[0].id and self._agent_visible_for_task(second, task):
                return self._unique_agents([ranked[0], second])[:count]

        return ranked[:count] or [self.pm_agent]

    def _agent_by_id(self, agent_id: Any) -> Any | None:
        normalized = str(agent_id or "").strip().lower()
        aliases = {
            "eng": "backend",
            "engineering": "backend",
            "ravi": "backend",
            "design": "designer",
            "mira": "designer",
            "kenji": "qa",
            "asha": "pm",
            "leah": "data",
            "analyst": "data",
            "data-analyst": "data",
        }
        normalized = aliases.get(normalized, normalized)
        for agent in self._agent_pool():
            if agent.id == normalized or agent.name.lower() == normalized:
                return agent
        return None

    def _normalize_chat_mode(self, event: dict[str, Any]) -> str:
        mode = str(event.get("mode") or "").strip().lower()
        if mode in {"dm", "direct", "private"}:
            return "dm"
        if mode == "team":
            return "team"
        channel = str(event.get("channel_id") or event.get("channel") or "")
        if channel.startswith("dm:") or channel.startswith("dm-") or event.get("agentId") or event.get("agent_id"):
            return "dm"
        return "team"

    def _channel_for_event(
        self,
        event: dict[str, Any],
        task: dict[str, Any],
        mode: str,
        requested_agent_id: Any = None,
    ) -> str:
        raw_channel = event.get("channel_id") or event.get("channel")
        if mode == "dm":
            agent = self._agent_by_id(requested_agent_id)
            if agent and not self._agent_visible_for_task(agent, task):
                agent = None
            if not agent and raw_channel:
                normalized = self._normalize_channel_id(raw_channel, task)
                if normalized.startswith("dm:"):
                    agent = self._agent_by_id(normalized.split(":", 1)[1])
                    if agent and not self._agent_visible_for_task(agent, task):
                        agent = None
            return self._dm_channel_for_agent(agent or self._agent_pool(task)[0])
        return "team"

    def _dm_channel_for_agent(self, agent: Any) -> str:
        aliases = {
            self.pm_agent.id: "asha",
            self.backend_agent.id: "ravi",
            self.designer_agent.id: "mira",
            self.qa_agent.id: "kenji",
            self.data_agent.id: "leah",
        }
        return f"dm:{aliases.get(getattr(agent, 'id', ''), getattr(agent, 'id', 'asha') or 'asha')}"

    def _normalize_channel_id(self, channel_id: Any, task: dict[str, Any]) -> str:
        raw = str(channel_id or "team").strip()
        if not raw or raw == "team" or raw == task.get("channel"):
            return "team"
        if raw.startswith("dm:"):
            agent_id = raw.split(":", 1)[1].strip().lower()
            agent = self._agent_by_id(agent_id)
            return self._dm_channel_for_agent(agent) if agent else f"dm:{agent_id or 'asha'}"
        if raw.startswith("dm-"):
            agent_id = raw[3:].strip().lower()
            agent = self._agent_by_id(agent_id)
            return self._dm_channel_for_agent(agent) if agent else f"dm:{agent_id or 'asha'}"
        return raw

    def _target_agent_id_from_channel(self, channel_id: str, requested_agent_id: Any = None) -> str | None:
        requested = self._agent_by_id(requested_agent_id)
        if requested:
            return requested.id
        if channel_id.startswith("dm:"):
            agent = self._agent_by_id(channel_id.split(":", 1)[1])
            return agent.id if agent else None
        return None

    def _messages_for_mode(
        self,
        transcript: list[dict[str, Any]],
        event: dict[str, Any],
        task: dict[str, Any],
    ) -> list[dict[str, Any]]:
        channel_id = event.get("channel_id") or "team"
        if event.get("mode") == "dm":
            return [
                message
                for message in transcript
                if self._normalize_channel_id(message.get("channel"), task) == channel_id
            ]
        return [
            message
            for message in transcript
            if self._normalize_channel_id(message.get("channel"), task) == "team"
        ]

    def _candidate_agent_id(self, task: dict[str, Any] | None) -> str | None:
        text = str(
            (task or {}).get("candidate_role")
            or (task or {}).get("participant_role")
            or (task or {}).get("user_role")
            or (task or {}).get("role")
            or ""
        ).lower()

        if any(token in text for token in ("qa", "quality", "tester", "testing", "test engineer")):
            return self.qa_agent.id
        if any(token in text for token in ("data", "analyst", "analytics", "metric", "dashboard", "sql")):
            return self.data_agent.id
        if any(token in text for token in ("frontend", "front-end", "designer", "design", "ux", "ui")):
            return self.designer_agent.id
        if any(token in text for token in ("backend", "api", "server", "database")):
            return self.backend_agent.id
        if any(token in text for token in ("product", "pm", "manager", "growth", "strategy")):
            return self.pm_agent.id
        return None

    def _agent_pool(self, task: dict[str, Any] | None = None) -> list[Any]:
        agents = [self.pm_agent, self.backend_agent, self.designer_agent, self.qa_agent, self.data_agent]
        candidate_agent_id = self._candidate_agent_id(task)
        return [agent for agent in agents if agent.id != candidate_agent_id][:5]

    def _agent_visible_for_task(self, agent: Any, task: dict[str, Any] | None) -> bool:
        return bool(agent) and agent.id in {"pm", "backend", "designer", "qa", "data"} and agent.id != self._candidate_agent_id(task)

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
                "patch", "prod", "cache", "timeout", "queue", "log", "scaling", "worker",
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
                "data", "metric", "metrics", "analytics", "dashboard", "sql", "csv", "experiment",
                "cohort", "retention", "conversion", "forecast", "anomaly", "precision", "evidence",
                "score", "scoring", "report", "rubric", "submission", "submit", "feedback", "skillrecord",
                "evaluation", "evaluator", "grade", "assessment", "criteria",
            ),
        }
        domain_boost = {
            "backend": self.backend_agent.id,
            "frontend": self.designer_agent.id,
            "design": self.designer_agent.id,
            "data": self.data_agent.id,
            "pm": self.pm_agent.id,
        }
        data_or_evidence_intent = domain == "data" or any(
            token in combined
            for token in (
                "data",
                "metric",
                "metrics",
                "analytics",
                "dashboard",
                "sql",
                "csv",
                "experiment",
                "cohort",
                "retention",
                "conversion",
                "forecast",
                "anomaly",
                "precision",
                "evidence",
                "score",
                "scoring",
                "report",
                "rubric",
                "submission",
                "submit",
                "feedback",
                "skillrecord",
                "evaluation",
            )
        )

        scores: dict[str, int] = {}
        visible_pool = self._agent_pool(task)
        for agent in visible_pool:
            score = 0
            for token in keyword_map[agent.id]:
                if token in combined:
                    score += 3
            if domain_boost.get(domain) == agent.id:
                score += 4
            if agent.id == self.data_agent.id and not data_or_evidence_intent:
                score -= 50
            if agent.name == memory.get("last_agent"):
                score -= 2
            if agent.name in (memory.get("last_agents") or []):
                score -= 1
            scores[agent.id] = score

        if not any(score > 0 for score in scores.values()):
            fallback = self.pm_agent if self._agent_visible_for_task(self.pm_agent, task) else visible_pool[0]
            scores[fallback.id] = scores.get(fallback.id, 0) + 2
            anchor = self._role_anchor_agent(task)
            scores[anchor.id] = scores.get(anchor.id, 0) + 1

        ranked = sorted(visible_pool, key=lambda agent: scores.get(agent.id, 0), reverse=True)
        return self._unique_agents(ranked)

    def _role_anchor_agent(self, task: dict[str, Any]) -> Any:
        domain = task.get("domain") or self._task_domain(task)
        preferences = {
            "backend": [self.backend_agent, self.qa_agent, self.pm_agent, self.data_agent, self.designer_agent],
            "frontend": [self.designer_agent, self.backend_agent, self.qa_agent, self.pm_agent, self.data_agent],
            "design": [self.designer_agent, self.pm_agent, self.qa_agent, self.backend_agent, self.data_agent],
            "data": [self.data_agent, self.backend_agent, self.pm_agent, self.qa_agent, self.designer_agent],
            "pm": [self.pm_agent, self.designer_agent, self.data_agent, self.backend_agent, self.qa_agent],
        }.get(domain, [self.pm_agent, self.backend_agent, self.designer_agent, self.qa_agent, self.data_agent])
        for agent in preferences:
            if self._agent_visible_for_task(agent, task):
                return agent
        return self._agent_pool(task)[0]

    def _technical_or_data_agent(self, task: dict[str, Any], message: str) -> Any:
        combined = f"{message} {task.get('domain', '')}".lower()
        if any(token in combined for token in ("data", "metric", "analytics", "dashboard", "sql", "csv", "experiment", "score", "report", "rubric", "submission", "skillrecord", "evaluation")):
            return self.data_agent if self._agent_visible_for_task(self.data_agent, task) else self._role_anchor_agent(task)
        if any(token in combined for token in ("ui", "ux", "screen", "copy", "accessibility")):
            return self.designer_agent if self._agent_visible_for_task(self.designer_agent, task) else self._role_anchor_agent(task)
        return self.backend_agent if self._agent_visible_for_task(self.backend_agent, task) else self._role_anchor_agent(task)

    def _crisis_lineup(self, task: dict[str, Any], message: str) -> list[Any]:
        anchor = self._role_anchor_agent(task)
        lineup = [self.pm_agent, anchor]
        if anchor.id == self.qa_agent.id:
            lineup.append(self.backend_agent)
        elif task.get("domain") in ("frontend", "design"):
            lineup.append(self.qa_agent)
        else:
            lineup.append(self.qa_agent)
        visible = [agent for agent in self._unique_agents(lineup) if self._agent_visible_for_task(agent, task)]
        crisis = task.get("room") or {}
        response_count = 2
        return (visible or self._agent_pool(task))[:response_count]

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

        if any(word in message for word in ("data", "metric", "analytics", "dashboard", "sql", "csv", "experiment", "score", "scoring", "report", "rubric", "submission", "feedback", "skillrecord", "evaluation")):
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
            "data": self.data_agent,
            "@data": self.data_agent,
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
                "what i have to do",
                "what do i do",
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
            return self.pm_agent

        if primary.id == self.pm_agent.id:
            if any(token in message for token in ("ui", "ux", "design", "screen", "copy", "banner", "message")):
                return self.designer_agent
            if any(token in message for token in ("api", "backend", "server", "retry", "patch", "code")):
                return self.backend_agent
            if any(token in message for token in ("metric", "analytics", "data", "dashboard", "retention", "experiment")):
                return self.data_agent
            return self.qa_agent

        return None

    def _legacy_safe_fallback_for(self, agent: Any, event: dict[str, Any]) -> str:
        message = str(event.get("candidate_message") or "").lower()
        greeting = any(word in message for word in ("hello", "hi", "hey"))

        if agent.id == self.pm_agent.id:
            return "hey, start with the safest next step" if greeting else "pick the next step and keep scope small"

        if agent.id == self.backend_agent.id:
            return "hey, tell me what behavior to build" if greeting else "tell me exact backend behavior"

        if agent.id == self.designer_agent.id:
            return "hey, I can help with user clarity" if greeting else "make the user message clear and calm"

        if agent.id == self.qa_agent.id:
            return "hey, I’ll watch risky edge cases" if greeting else "name the risky case we should prove"

        if agent.id == self.data_agent.id:
            return "hey, I can help pin down the metric" if greeting else "name the signal and the caveat"

        return "okay, keep going"

    def _safe_fallback_for(
        self,
        agent: Any,
        event: dict[str, Any],
        memory: dict[str, Any] | None = None,
    ) -> str:
        memory = memory or {}
        message = str(event.get("candidate_message") or "").lower()
        task = event.get("task") or {}
        title = task.get("title") or "this task"
        requirement = (task.get("requirements") or ["the main outcome"])[0]
        focus_file = self._first_workspace_file(task)
        turn = max(0, int(memory.get("agent_reply_count", 0)))
        greeting = bool(re.fullmatch(r"(hi+|hello+|hey+|yo+|sup)[!. ]*", message.strip()))
        has_decision = any(token in message for token in ("ship", "cut", "defer", "priority", "first", "then", "rollback"))

        if agent.id == self.pm_agent.id:
            options = [
                f"Let's keep {title} narrow: protect {requirement} first and say what waits.",
                "I can live with that direction if the deferred work is explicit and the customer impact stays first.",
                f"Use {focus_file} as the shared reference, then make one ship-or-hold call.",
            ]
            return "Hey, room is ready. Start with one decision and one thing you are not taking on." if greeting else options[(turn + int(has_decision)) % len(options)]

        if agent.id == self.backend_agent.id:
            options = [
                "From engineering, name the expected success, failure, retry, and rollback behavior before widening scope.",
                f"I'd keep the technical path tied to {focus_file} and avoid a broad rewrite until QA has a retest target.",
                "That can work if the contract is clear enough for the client and rollback path to behave predictably.",
            ]
            return "Hey. Bring me the broken behavior or API path and I will sanity-check the smallest safe fix." if greeting else options[turn % len(options)]

        if agent.id == self.designer_agent.id:
            options = [
                "For UX, keep the recovery state calm: what happened, what is safe, and what the user can do next.",
                f"I'd make {focus_file} clearer before adding polish; uncertainty is what users will feel first.",
                "If we ship this, loading, error, and retry states need to look intentional rather than patched on.",
            ]
            return "Hey, I am here for the user-facing state when you are ready." if greeting else options[turn % len(options)]

        if agent.id == self.qa_agent.id:
            options = [
                "I am okay moving forward only after one messy path and one rollback check are named.",
                f"For QA, {focus_file} needs a retest target; otherwise we are just trusting the plan.",
                "That sounds shippable only if we prove the failure path, not just the happy path.",
            ]
            return "Hey. I will watch the release risk; give me the edge case when you have it." if greeting else options[turn % len(options)]

        if agent.id == self.data_agent.id:
            options = [
                "From data, pick one signal that proves the decision worked and one caveat that could mislead us.",
                f"I'd keep the metric tied to {requirement}; extra dashboards will slow the call down.",
                "The room can use the metric, but only if we name the segment and the limitation clearly.",
            ]
            return "Hey. I can help keep the success signal honest." if greeting else options[turn % len(options)]

        return "Keep it concrete: decision, tradeoff, validation, and next owner."

    def _resolve_phase(self, event: dict[str, Any], memory: dict[str, Any]) -> str:
        event_type = str(event.get("event_type") or "")

        if event_type == "simulation_start":
            return "planning"

        if event_type == "crisis_triggered":
            return "crisis"

        if event_type in ("tests_failed", "tests_passed"):
            return "validation"

        if event_type == "submit_solution":
            return "submitted"

        if memory.get("candidate_plan_shared"):
            return "planning"

        if memory.get("asked_clarification"):
            return "discovery"

        return memory.get("phase") or "planning"

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
        score_cap = self._submission_score_cap(session)
        if score_cap is not None:
            scores = {key: min(int(value), score_cap) for key, value in scores.items()}
            session["scores"] = deepcopy(scores)

        report["scores"] = scores
        report["rubric"] = scores
        report["overall_score"] = self._average_score(scores)
        report["observer_notes"] = list(session.get("observer_notes") or [])[-6:]
        report["timeline"] = deepcopy(session["memory"].get("timeline") or [])
        report["evaluator"] = "Quinn"
        report["mode"] = "live_simulation"
        report["status"] = "completed"
        report["team_notes"] = self._team_notes_for_report(session, scores)
        if not report.get("next_steps"):
            report["next_steps"] = report.get("improvement_plan") or []
        if not report.get("weaknesses"):
            report["weaknesses"] = report.get("risks") or []
        if not report.get("recommendation"):
            report["recommendation"] = self._recommendation_for_scores(scores)

        task = session["task"]
        report["task"] = {
            "title": task["title"],
            "role": task["role"],
            "company": task["company"],
            "duration": f"{task['deadline']} mins",
        }

        if not report.get("summary"):
            report["summary"] = self._simple_report_summary(scores)
        if score_cap is not None and score_cap <= 44:
            report["summary"] = "Not enough concrete work was submitted to show a reliable DayZero performance signal."
        report["score_summary"] = self._simple_report_summary(scores)
        report["submitted_at"] = _utc_now()

        return report

    def _team_notes_for_report(self, session: dict[str, Any], scores: dict[str, int]) -> list[dict[str, Any]]:
        task = session.get("task") or {}
        files = self._allowed_file_references(task)
        focus_file = files[0] if files else "the shared workspace"
        memory = session.get("memory") or {}
        decisions = memory.get("decisions") or []
        risks = memory.get("unresolved_risks") or memory.get("blockers") or []
        validation = memory.get("passed_tests") or memory.get("failed_tests") or []

        return [
            {
                "speaker_name": "Asha",
                "speaker_title": "Product Manager",
                "strength": decisions[-1] if decisions else "Kept the room moving toward a decision instead of treating the task like a solo exercise.",
                "risk": "Scope and deferred work need to stay explicit when the room pressure changes.",
                "score": int(scores.get("prioritization", scores.get("leadership", 0))),
            },
            {
                "speaker_name": "Ravi",
                "speaker_title": "Engineering Lead",
                "strength": f"Anchored the technical discussion to {focus_file} and the behavior that needed to hold under pressure.",
                "risk": risks[-1] if risks else "Rollback and failure-mode language could be sharper before a real release call.",
                "score": int(scores.get("technicalDepth", 0)),
            },
            {
                "speaker_name": "Kenji",
                "speaker_title": "QA Engineer",
                "strength": validation[-1] if validation else "Showed awareness that a decision needs proof, not just confidence.",
                "risk": "The final handoff should name the exact validation gate and the edge case still being watched.",
                "score": int((scores.get("ownership", 0) + scores.get("technicalDepth", 0)) / 2),
            },
        ]

    def _recommendation_for_scores(self, scores: dict[str, int]) -> str:
        overall = self._average_score(scores)
        if overall >= 84:
            return "Strong hire signal"
        if overall >= 70:
            return "Promising with follow-up"
        if overall >= 55:
            return "Mixed signal"
        return "Needs more evidence"

    def _submission_score_cap(self, session: dict[str, Any]) -> int | None:
        submission = str(session.get("submission") or "").strip()
        user_messages = [
            entry
            for entry in session.get("transcript") or []
            if str(entry.get("role") or "").lower() == "user"
        ]
        words = re.findall(r"[A-Za-z0-9_]+", submission)
        meaningful_words = [
            word
            for word in words
            if word.lower() not in {"task", "role", "channel"}
        ]
        lowered = submission.lower()
        decision_terms = (
            "decision",
            "tradeoff",
            "defer",
            "validate",
            "validation",
            "test",
            "owner",
            "rollback",
            "risk",
            "because",
            "changed",
            "implemented",
            "fixed",
        )
        strict_cap = self._strict_evaluation_cap(session)

        if not submission and not user_messages:
            return min(32, strict_cap)
        if "fixme" in lowered and not any(term in lowered for term in decision_terms):
            return min(44, strict_cap)
        if len(meaningful_words) < 12 and len(user_messages) <= 1:
            return min(38, strict_cap)
        if len(meaningful_words) < 25:
            return min(48, strict_cap)
        return strict_cap if strict_cap < 100 else None

    def _strict_evaluation_cap(self, session: dict[str, Any]) -> int:
        submission = str(session.get("submission") or "").strip()
        user_text = " ".join(
            str(entry.get("message") or "")
            for entry in session.get("transcript") or []
            if str(entry.get("role") or "").lower() == "user"
        )
        combined = f"{user_text} {submission}".lower()
        words = re.findall(r"[a-z0-9_]+", combined)
        meaningful_words = [
            word for word in words
            if word not in {"hi", "hello", "hey", "yo", "sup", "thanks", "okay", "ok"}
        ]
        if not meaningful_words:
            return 15

        decision = any(token in combined for token in ("decision", "we should", "i will", "i'll", "ship", "hold", "priority", "prioritize", "first"))
        tradeoff = any(token in combined for token in ("tradeoff", "cut", "defer", "scope", "instead", "not ship", "leave out", "smallest"))
        evidence = any(token in combined for token in ("because", "evidence", "metric", "data", "trend", "log", "ticket", "customer", "support", "segment"))
        validation = any(token in combined for token in ("test", "validate", "validation", "retest", "proof", "edge", "rollback", "monitor", "mobile safari"))
        handoff = any(token in combined for token in ("owner", "handoff", "next step", "eta", "rollback trigger", "support update", "release note"))

        if len(meaningful_words) < 8 and not decision:
            return 20
        if decision and not tradeoff and not validation and not evidence:
            return 40
        if decision and tradeoff and not (evidence and validation):
            return 60
        if decision and evidence and validation and not handoff:
            return 80
        if decision and tradeoff and evidence and validation and handoff:
            return 100
        return 45

    def _simple_report_summary(self, scores: dict[str, int]) -> str:
        overall = self._average_score(scores)

        if overall >= 80:
            return "Strong sprint performance. The candidate stayed composed, made visible tradeoffs, and kept the room oriented around a shippable path."
        if overall >= 65:
            return "Solid simulation signal. The candidate collaborated well, but the final decision, validation gate, or deferred scope could be sharper."
        return "Incomplete work signal. The candidate needs to drive clearer decisions, name risk earlier, and give the room stronger evidence before handoff."

    def _message_payload(
        self,
        profile: dict[str, Any],
        message: str | None = None,
        created_at: str | None = None,
        channel: str | None = None,
    ) -> dict[str, Any]:
        payload = {
            "speaker_name": profile.get("name") or profile.get("speaker_name"),
            "speaker_title": profile.get("role") or profile.get("speaker_title"),
            "avatar": profile.get("avatar"),
            "role": "agent",
            "created_at": created_at or _utc_now(),
            "channel": channel or profile.get("channel") or "team",
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
        if len(text) <= 700:
            return text

        trimmed = text[:700].rstrip()
        sentence_end = max(trimmed.rfind("."), trimmed.rfind("!"), trimmed.rfind("?"))
        if sentence_end >= 180:
            return trimmed[: sentence_end + 1]

        words = trimmed.split()
        if len(words) > 90:
            trimmed = " ".join(words[:90]).rstrip()

        trimmed = trimmed.rstrip(" ,;:")
        return trimmed if trimmed.endswith((".", "!", "?")) else f"{trimmed}."

    def _allowed_file_references(self, task: dict[str, Any]) -> list[str]:
        references: list[str] = []
        for item in task.get("workspace_files") or []:
            if isinstance(item, dict):
                references.extend([
                    str(item.get("path") or "").strip(),
                    str(item.get("name") or "").strip(),
                ])
            else:
                references.append(str(item).strip())
        references.extend(str(item).strip() for item in task.get("files") or [])
        return [item for item in dict.fromkeys(references) if item]

    def _sanitize_file_references(self, text: str, task: dict[str, Any]) -> str:
        allowed = self._allowed_file_references(task)
        if not allowed:
            return str(text or "")

        allowed_lower = {item.lower() for item in allowed}
        allowed_basenames = {item.replace("\\", "/").split("/")[-1].lower() for item in allowed}
        fallback = allowed[0]
        pattern = re.compile(r"\b(?:[\w.-]+[\\/])*[\w.-]+\.(?:js|jsx|ts|tsx|py|md|css|html|json|sql|csv|log|txt)\b")

        def replace(match: re.Match[str]) -> str:
            reference = match.group(0).strip()
            lowered = reference.lower()
            basename = reference.replace("\\", "/").split("/")[-1].lower()
            if lowered in allowed_lower or basename in allowed_basenames:
                return reference
            return fallback

        return pattern.sub(replace, str(text or ""))

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

        if words[0].lower() in {"a", "an", "the", "backend", "frontend", "product", "qa"}:
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
            "data",
        )

        return any(marker in lowered for marker in intro_markers) and any(marker in lowered for marker in role_markers)

    def _average_score(self, scores: dict[str, int]) -> int:
        values = [int(value) for value in scores.values()]
        return round(sum(values) / len(values)) if values else 0

    def _bump(self, scores: dict[str, int], key: str, amount: int) -> None:
        current = int(scores.get(key, 0))
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
