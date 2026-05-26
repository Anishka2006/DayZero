from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from typing import Any

from ai_engine.core.llm import ask_ai, configured_provider, default_model_for

logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    id = "base"
    name = "Agent"
    role = "AI Coworker"
    avatar = "A"
    personality = "Calm and helpful"
    expertise = "General execution"
    allowed_topics = ("current task execution",)
    avoid_topics = ("generic advice", "areas outside this role's expertise")
    speaking_style = "short, direct, and realistic"
    pressure_style = "keeps the room moving without over-explaining"
    constraints = ("Stay in role.", "Keep replies short.")

    def profile(self) -> dict[str, str]:
        return {
            "id": self.id,
            "name": self.name,
            "role": self.role,
            "avatar": self.avatar,
        }

    def generate_response(self, event: dict[str, Any], memory: dict[str, Any], scores: dict[str, int]) -> str:
        llm_response = self._generate_llm_response(event, memory, scores)
        if llm_response:
            logger.info(
                "agent_response source=llm agent=%s event=%s channel=%s chars=%s",
                self.id,
                self._event_type(event),
                event.get("channel_id") or "team",
                len(llm_response),
            )
            return llm_response
        fallback = self.fallback_response(event, memory, scores)
        logger.warning(
            "agent_response source=fallback agent=%s event=%s channel=%s candidate_len=%s",
            self.id,
            self._event_type(event),
            event.get("channel_id") or "team",
            len(self._message(event)),
        )
        return fallback

    @abstractmethod
    def fallback_response(self, event: dict[str, Any], memory: dict[str, Any], scores: dict[str, int]) -> str:
        raise NotImplementedError

    def _generate_llm_response(
        self,
        event: dict[str, Any],
        memory: dict[str, Any],
        scores: dict[str, int],
    ) -> str | None:
        prompt = self._build_user_prompt(event, memory, scores)
        provider = configured_provider() or "none"
        logger.info(
            "agent_llm_request agent=%s name=%s provider=%s model=%s event=%s channel=%s",
            self.id,
            self.name,
            provider,
            default_model_for(provider) if provider != "none" else "none",
            self._event_type(event),
            event.get("channel_id") or "team",
        )
        response = ask_ai(
            prompt=prompt,
            system_prompt=self._build_system_prompt(event),
            temperature=0.85,
            max_tokens=320,
        )
        return self._clean_response(response)

    def _build_system_prompt(self, event: dict[str, Any] | None = None) -> str:
        constraints = "\n".join(f"- {item}" for item in self.constraints)
        task = (event or {}).get("task") or {}
        room = task.get("room") or {}
        question_allowed = bool((event or {}).get("question_allowed"))
        allowed_topics = ", ".join(self.allowed_topics)
        avoid_topics = ", ".join(self.avoid_topics)
        room_line = ""
        if room:
            room_line = (
                f"Room: {task.get('company', 'the company')} / {task.get('title', 'current task')} / "
                f"{room.get('severity', 'active')} severity / deadline {room.get('deadline', task.get('deadline', 'unknown'))} mins.\n"
            )
        return (
            f"You are {self.name}, a {self.role} inside a DayZero company sprint simulation.\n"
            f"Personality: {self.personality}\n"
            f"Expertise: {self.expertise}\n"
            f"Allowed topics: {allowed_topics}\n"
            f"Avoid topics: {avoid_topics}\n"
            f"Speaking style: {self.speaking_style}\n"
            f"Pressure style: {self.pressure_style}\n"
            f"{room_line}"
            "You are inside a DayZero company sprint simulation. Only use the active task and active workspace files. Do not invent files, tasks, companies, or requirements. If a file is not listed, do not mention it.\n"
            "Do not introduce yourself unless the candidate asks who you are. Reply naturally, shortly, and role-specifically.\n"
            "Behave like a real coworker inside a high-pressure startup sprint or incident room.\n"
            "You are not a tutor and not a generic chatbot.\n"
            "Stay inside your role boundary. If the candidate asks outside your lane, hand it to the right teammate briefly.\n"
            "Rules:\n"
            f"{constraints}\n"
            "- Do not block on candidate introductions; keep the work tied to the active task.\n"
            "- You are a teammate, not an interviewer. Guide, suggest, react, and explain naturally.\n"
            f"- Question allowed in this reply: {'yes' if question_allowed else 'no'}.\n"
            "- If questions are not allowed, do not ask anything. Give a concrete suggestion or next step instead.\n"
            "- If the candidate seems confused, explain the task simply and point to the relevant listed file.\n"
            "- Reference concrete files, logs, metrics, or active workspace context when available.\n"
            "- Do not invent file names; use only the active file or listed workspace files.\n"
            "- React to the previous teammate if useful: agree, disagree, or add the missing risk in one line.\n"
            "- Reply in 1 or 2 complete short sentences. Never stop mid-thought.\n"
            "- Use casual teammate English, like quick Slack messages.\n"
            "- Use contractions naturally, but do not overdo slang.\n"
            "- It is okay to sound slightly rushed, uncertain, or opinionated when the situation calls for it.\n"
            "- Prefer simple words over polished or corporate language.\n"
            "- Avoid canned phrases like 'action logged', 'as an AI', 'I will continue to evaluate', or 'great question'.\n"
            "- Avoid jargon and long setup. Lead with the point.\n"
            "- Be specific to the current situation.\n"
            "- Do not write code unless explicitly asked for a tiny example.\n"
            "- Avoid scoring or evaluator language in visible team chat; final evaluation happens in the background.\n"
            "- Do not narrate your reasoning or mention being an AI model.\n"
        )

    def _build_user_prompt(
        self,
        event: dict[str, Any],
        memory: dict[str, Any],
        scores: dict[str, int],
    ) -> str:
        event_type = self._event_type(event)
        candidate_message = self._message(event) or "(no direct candidate message)"
        code = self._code(event)
        test_results = self._test_results(event)
        task = event.get("task") or {}
        timeline = memory.get("timeline") or []
        recent_timeline = timeline[-3:]
        room_context = event.get("room_context") or []
        active_file = str(event.get("active_file") or "").strip()
        workspace_snapshot = str(event.get("workspace_snapshot") or "").strip()
        room = task.get("room") or {}
        workspace_files = task.get("workspace_files") or []
        channel_id = str(event.get("channel_id") or "team")
        target_agent_id = str(event.get("target_agent_id") or "")
        current_task = event.get("current_task") or event.get("currentTask") or {}
        selected_channel = current_task.get("selectedChannel") or channel_id
        selected_agent = current_task.get("selectedAgent") or target_agent_id or "(none)"
        decisions = memory.get("decisions") or []
        blockers = memory.get("blockers") or []
        unresolved_risks = memory.get("unresolved_risks") or []
        referenced_files = memory.get("referenced_files") or []
        crisis_events = memory.get("crisis_events") or []
        crisis_event = event.get("crisis_event") or memory.get("current_crisis") or {}

        return (
            "Current simulation context:\n"
            f"- Event type: {event_type}\n"
            f"- Conversation channel: {channel_id}\n"
            f"- Target agent id: {target_agent_id or '(none)'}\n"
            f"- Question allowed: {'yes' if event.get('question_allowed') else 'no'}\n"
            f"- Active task context: {{'taskTitle': {current_task.get('taskTitle') or task.get('title') or '(unknown)'!r}, 'company': {current_task.get('company') or task.get('company') or '(unknown)'!r}, 'role': {current_task.get('role') or task.get('role') or '(unknown)'!r}, 'scenario': {current_task.get('scenario') or task.get('problem') or '(unknown)'!r}, 'skills': {current_task.get('skills') or task.get('requirements') or []}, 'files': {current_task.get('files') or task.get('files') or []}, 'selectedChannel': {selected_channel!r}, 'selectedAgent': {selected_agent!r}}}\n"
            f"- Task title: {task.get('title') or '(unknown)'}\n"
            f"- Company: {task.get('company') or '(unknown)'}\n"
            f"- Channel: #{task.get('channel') or room.get('channel') or 'war-room'}\n"
            f"- Candidate role: {task.get('role') or '(unknown)'}\n"
            f"- Task problem: {task.get('problem') or '(unknown)'}\n"
            f"- Requirements: {task.get('requirements') or []}\n"
            f"- Urgency: {room.get('urgency') or task.get('difficulty') or '(unknown)'}\n"
            f"- Severity: {room.get('severity') or '(unknown)'}\n"
            f"- Sprint context: {room.get('sprint') or '(unknown)'}\n"
            f"- Business impact: {room.get('business_impact') or '(unknown)'}\n"
            f"- Risk: {room.get('risk') or task.get('crisis') or '(unknown)'}\n"
            f"- Blockers: {room.get('blockers') or []}\n"
            f"- Room timeline: {room.get('timeline') or []}\n"
            f"- Current crisis: {crisis_event or '(none)'}\n"
            f"- Candidate message: {candidate_message}\n"
            f"- Current phase: {memory.get('phase', 'planning')}\n"
            f"- Current skill focus: {event.get('skill_focus') or memory.get('skill_focus') or 'communication'}\n"
            f"- Candidate introduced: {memory.get('candidate_introduced', False)}\n"
            f"- Candidate name: {memory.get('candidate_name') or event.get('candidate_name') or '(unknown)'}\n"
            f"- Last agent: {memory.get('last_agent') or 'none'}\n"
            f"- Candidate plan shared: {memory.get('candidate_plan_shared', False)}\n"
            f"- Asked clarification: {memory.get('asked_clarification', False)}\n"
            f"- Mentioned tradeoff: {memory.get('mentioned_tradeoff', False)}\n"
            f"- Handled crisis: {memory.get('handled_crisis', False)}\n"
            f"- Decisions so far: {decisions[-4:]}\n"
            f"- Open blockers: {blockers[-4:]}\n"
            f"- Unresolved risks: {unresolved_risks[-4:]}\n"
            f"- Referenced files: {referenced_files[-5:]}\n"
            f"- Crisis events seen: {crisis_events[-3:]}\n"
            f"- Scores: {scores}\n"
            f"- Recent timeline: {recent_timeline}\n"
            f"- Room context: {room_context[-3:]}\n"
            f"- Active file: {active_file or '(none)'}\n"
            f"- Workspace files: {workspace_files or task.get('files') or []}\n"
            f"- Test results: {test_results}\n"
            f"- Workspace snapshot: {workspace_snapshot[:900] if workspace_snapshot else '(no workspace snapshot shared)'}\n"
            f"- Code excerpt: {code[:700] if code else '(no code shared)'}\n\n"
            "Reply as this coworker inside the room. If this is a DM channel, answer only as the targeted teammate and keep it private to that thread. Push the work forward. Do not ask a question unless question_allowed is yes."
        )

    def _message(self, event: dict[str, Any]) -> str:
        return str(event.get("candidate_message") or "").strip()

    def _message_lower(self, event: dict[str, Any]) -> str:
        return self._message(event).lower()

    def _event_type(self, event: dict[str, Any]) -> str:
        return str(event.get("event_type") or "").strip().lower()

    def _test_results(self, event: dict[str, Any]) -> dict[str, Any]:
        return event.get("test_results") or {}

    def _code(self, event: dict[str, Any]) -> str:
        return str(event.get("code") or "").strip()

    def _clean_response(self, text: str | None) -> str | None:
        if not text:
            return None

        cleaned = text.strip().replace("\r", " ")
        if not cleaned:
            return None

        lines = [line.strip("- ").strip() for line in cleaned.splitlines() if line.strip()]
        merged = " ".join(lines)
        merged = merged.replace("```", "").strip()
        if not merged:
            return None

        if len(merged) > 700:
            trimmed = merged[:700].rstrip()
            sentence_end = max(trimmed.rfind("."), trimmed.rfind("!"), trimmed.rfind("?"))
            if sentence_end >= 180:
                trimmed = trimmed[: sentence_end + 1]
            merged = trimmed.rstrip(" ,;:")
            if merged and merged[-1] not in ".!?":
                merged += "."
        return merged

    def _focus_file(self, event: dict[str, Any], task: dict[str, Any], keywords: tuple[str, ...] = ()) -> str:
        active_file = str(event.get("active_file") or "").strip()
        if active_file:
            return active_file

        files = task.get("workspace_files") or task.get("files") or []
        normalized: list[str] = []
        for item in files:
            if isinstance(item, dict):
                name = str(item.get("path") or item.get("name") or "").strip()
            else:
                name = str(item).strip()
            if name:
                normalized.append(name)

        lowered_keywords = tuple(keyword.lower() for keyword in keywords)
        for name in normalized:
            lowered_name = name.lower()
            if any(keyword in lowered_name for keyword in lowered_keywords):
                return name

        return normalized[0] if normalized else "the active file"

    def _two_sentences(self, primary: str, secondary: str | None = None) -> str:
        if secondary:
            return f"{primary.strip()} {secondary.strip()}".strip()
        return primary.strip()
