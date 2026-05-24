from __future__ import annotations

import random
from copy import deepcopy
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from ai_engine.agents import BackendAgent, DesignerAgent, ObserverAgent, PMAgent, QAAgent


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


DEFAULT_MEMORY = {
    "candidate_plan_shared": False,
    "asked_clarification": False,
    "handled_crisis": False,
    "mentioned_tradeoff": False,
    "crisis_already_triggered": False,
    "tests_run_count": 0,
    "failed_tests": [],
    "passed_tests": [],
    "timeline": [],
    "phase": "intro",
    "last_agent": None,
    "last_agents": [],
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
        self.observer_agent = ObserverAgent()
        self.sessions: dict[str, dict[str, Any]] = {}

    def start_simulation(
        self,
        task_id: str | None = None,
        role: str | None = None,
        participant_name: str | None = None,
    ) -> dict[str, Any]:
        task = deepcopy(self._select_task(task_id=task_id, role=role))
        memory = deepcopy(DEFAULT_MEMORY)
        scores = deepcopy(DEFAULT_SCORES)
        session_id = str(uuid4())

        if participant_name:
            memory["candidate_name"] = participant_name

        timeline_event = {
            "title": "Simulation started",
            "description": f"{task['company']} opened {task['title'].lower()}.",
            "created_at": _utc_now(),
        }
        memory["timeline"].append(timeline_event)

        initial_messages = self._initial_messages_for(task)
        transcript = [
            self._message_payload(entry, created_at=_utc_now())
            for entry in initial_messages
        ]

        observer_note = "Room opened. Watching clarity and ownership."

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

        if normalized_type == "crisis_triggered" and memory.get("crisis_already_triggered"):
            new_messages = []
        else:
            if normalized_type == "crisis_triggered":
                memory["crisis_already_triggered"] = True
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

        observer_note = ""
        if normalized_type == "submit_solution" or memory.get("simulation_done"):
            observer_event = {**event, "room_context": recent_room_context}
            observer_note = self.observer_agent.generate_response(observer_event, memory, scores)
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
        task = deepcopy(TASKS["mobile-growth"])

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

        task = deepcopy(self._select_task(task_id=event.get("task_id"), role=event.get("role")))
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

    def _select_task(self, task_id: str | None = None, role: str | None = None) -> dict[str, Any]:
        if task_id and task_id in TASKS:
            return TASKS[task_id]

        role_text = str(role or "").lower()

        if any(token in role_text for token in ("backend", "security", "infra", "platform", "incident")):
            return TASKS["security-patch"]

        if any(token in role_text for token in ("product", "growth", "mobile", "full stack", "fullstack")):
            return TASKS["mobile-growth"]

        if any(token in role_text for token in ("data", "analytics", "fraud")):
            return TASKS["fraud-dashboard"]

        return TASKS["mobile-growth"]

    def _initial_messages_for(self, task: dict[str, Any]) -> list[dict[str, Any]]:
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

        if original_message:
            memory["user_message_count"] = int(memory.get("user_message_count", 0)) + 1

        if memory["user_message_count"] >= 12:
            memory["simulation_done"] = True

        extracted_name = self._extract_candidate_name(original_message)
        if extracted_name:
            memory["candidate_name"] = extracted_name

        if any(token in message for token in ("plan", "first", "then", "priority", "i'll", "i will", "ship")):
            memory["candidate_plan_shared"] = True

        if any(token in message for token in ("clarify", "why", "what exactly", "which", "can you confirm", "what does")):
            memory["asked_clarification"] = True

        if any(token in message for token in ("tradeoff", "cut", "focus", "scope", "defer")):
            memory["mentioned_tradeoff"] = True

        if event_type == "crisis_triggered":
            memory["handled_crisis"] = True

        if event_type in ("tests_failed", "tests_passed"):
            memory["tests_run_count"] = int(memory.get("tests_run_count", 0)) + 1
            memory["failed_tests"] = list(test_results.get("failed") or [])
            memory["passed_tests"] = list(test_results.get("passed") or [])

    def _update_scores(self, scores: dict[str, int], event: dict[str, Any]) -> None:
        message = str(event.get("candidate_message") or "").lower()
        event_type = str(event.get("event_type") or "")

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

        for agent in lineup:
            agent_event = {
                **event,
                "room_context": rolling_context[-5:],
                "candidate_name": memory.get("candidate_name") or session.get("participant_name") or "",
            }

            reply = agent.generate_response(agent_event, memory, scores)

            if not reply:
                reply = self._safe_fallback_for(agent, event)

            payload = self._message_payload(agent.profile(), self._shorten_agent_reply(reply))
            generated.append(payload)
            rolling_context.append(f"{payload['speaker_name']}: {payload['message']}")

        return generated

    def _select_agent_lineup(self, event: dict[str, Any], memory: dict[str, Any]) -> list[Any]:
        message = str(event.get("candidate_message") or "").lower()
        event_type = str(event.get("event_type") or "")

        direct_agent = self._directly_addressed_agent(message)
        if direct_agent:
            return [direct_agent]

        if event_type == "submit_solution":
            return [self.pm_agent, self.qa_agent, self.backend_agent]

        if event_type in ("tests_failed", "tests_passed", "run_tests"):
            return [self.qa_agent, self.backend_agent]

        if event_type == "crisis_triggered":
            return [self.pm_agent, self.backend_agent, self.qa_agent]

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

        if any(word in message for word in ("plan", "priority", "scope", "deadline", "ship", "customer", "decision", "what should i do", "what to do", "start")):
            return self.pm_agent

        agents = [self.pm_agent, self.backend_agent, self.designer_agent, self.qa_agent]
        last_agent = memory.get("last_agent")

        available = [
            agent for agent in agents
            if agent.name != last_agent
        ]

        return random.choice(available or agents)

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

        if primary.id == self.pm_agent.id:
            if any(token in message for token in ("ui", "ux", "design", "screen", "copy", "banner", "message")):
                return self.designer_agent
            if any(token in message for token in ("api", "backend", "server", "retry", "patch", "code")):
                return self.backend_agent
            return self.qa_agent

        return None

    def _safe_fallback_for(self, agent: Any, event: dict[str, Any]) -> str:
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

        if memory.get("candidate_plan_shared"):
            return "planning"

        if memory.get("asked_clarification"):
            return "discovery"

        return memory.get("phase") or "intro"

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
            description = "Room moved into incident mode."
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

        report["summary"] = self._simple_report_summary(scores)
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

        if len(words) > 22:
            return " ".join(words[:22]).rstrip(".,!") + "."

        return text

    def _shorten_user_message(self, text: str) -> str:
        text = str(text or "").strip()

        if len(text) > 350:
            return text[:347].rstrip() + "..."

        return text

    def _extract_candidate_name(self, message: str) -> str | None:
        lowered = message.lower().strip()

        starters = [
            "my name is ",
            "i am ",
            "i'm ",
            "this is ",
        ]

        for starter in starters:
            if lowered.startswith(starter):
                name = message[len(starter):].strip().split()[0]
                return name.strip(".,!").capitalize()

        return None

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
) -> dict[str, Any]:
    return ORCHESTRATOR.start_simulation(
        task_id=task_id,
        role=role,
        participant_name=participant_name,
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