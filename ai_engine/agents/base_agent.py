from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

from ai_engine.core.llm import ask_ai


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
            return llm_response
        return self.fallback_response(event, memory, scores)

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
        response = ask_ai(
            prompt=prompt,
            system_prompt=self._build_system_prompt(event),
            temperature=0.85,
            max_tokens=160,
        )
        return self._clean_response(response)

    def _build_system_prompt(self, event: dict[str, Any] | None = None) -> str:
        constraints = "\n".join(f"- {item}" for item in self.constraints)
        task = (event or {}).get("task") or {}
        room = task.get("room") or {}
        allowed_topics = ", ".join(self.allowed_topics)
        avoid_topics = ", ".join(self.avoid_topics)
        room_line = ""
        if room:
            room_line = (
                f"Room: {task.get('company', 'the company')} / {task.get('title', 'current task')} / "
                f"{room.get('severity', 'active')} severity / deadline {room.get('deadline', task.get('deadline', 'unknown'))} mins.\n"
            )
        return (
            f"You are {self.name}, a {self.role} inside the DayZero hiring simulation.\n"
            f"Personality: {self.personality}\n"
            f"Expertise: {self.expertise}\n"
            f"Allowed topics: {allowed_topics}\n"
            f"Avoid topics: {avoid_topics}\n"
            f"Speaking style: {self.speaking_style}\n"
            f"Pressure style: {self.pressure_style}\n"
            f"{room_line}"
            "Behave like a real coworker inside a high-pressure startup sprint or incident room.\n"
            "You are not a tutor and not a generic chatbot.\n"
            "Stay inside your role boundary. If the candidate asks outside your lane, hand it to the right teammate briefly.\n"
            "Rules:\n"
            f"{constraints}\n"
            "- If the candidate has not introduced themself yet, keep the room in intro mode and ask for a quick intro.\n"
            "- Once the candidate introduces themself, welcome them briefly and move toward the first decision.\n"
            "- Test one skill at a time without announcing the test: ask for a decision, evidence, tradeoff, validation plan, or owner.\n"
            "- Do not sound like a quiz. Make the ask feel like a real teammate needing clarity.\n"
            "- Reference concrete files, logs, metrics, or active workspace context when available.\n"
            "- React to the previous teammate if useful: agree, disagree, or add the missing risk in one line.\n"
            "- Reply in 1 or 2 short sentences.\n"
            "- Use casual teammate English, like quick Slack messages.\n"
            "- Use contractions naturally, but do not overdo slang.\n"
            "- It is okay to sound slightly rushed, uncertain, or opinionated when the situation calls for it.\n"
            "- Prefer simple words over polished or corporate language.\n"
            "- Avoid canned phrases like 'action logged', 'as an AI', 'I will continue to evaluate', or 'great question'.\n"
            "- Avoid jargon and long setup. Lead with the point.\n"
            "- Be specific to the current situation.\n"
            "- Do not write code unless explicitly asked for a tiny example.\n"
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
        decisions = memory.get("decisions") or []
        blockers = memory.get("blockers") or []
        unresolved_risks = memory.get("unresolved_risks") or []
        referenced_files = memory.get("referenced_files") or []
        crisis_events = memory.get("crisis_events") or []
        crisis_event = event.get("crisis_event") or memory.get("current_crisis") or {}

        return (
            "Current simulation context:\n"
            f"- Event type: {event_type}\n"
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
            f"- Current phase: {memory.get('phase', 'intro')}\n"
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
            "Reply as this coworker inside the room. Push the work forward."
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

        if len(merged) > 360:
            merged = merged[:357].rstrip() + "..."
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
