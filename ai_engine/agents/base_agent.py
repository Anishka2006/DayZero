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
            system_prompt=self._build_system_prompt(),
            temperature=0.85,
            max_tokens=160,
        )
        return self._clean_response(response)

    def _build_system_prompt(self) -> str:
        constraints = "\n".join(f"- {item}" for item in self.constraints)
        return (
            f"You are {self.name}, a {self.role} inside the DayZero hiring simulation.\n"
            f"Personality: {self.personality}\n"
            f"Expertise: {self.expertise}\n"
            "Behave like a real coworker inside a high-pressure startup sprint.\n"
            "You are not a tutor and not a generic chatbot.\n"
            "Rules:\n"
            f"{constraints}\n"
            "- Reply in 1 or 2 short sentences.\n"
            "- Use casual teammate English, like quick Slack messages.\n"
            "- Prefer simple words over polished or corporate language.\n"
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
        timeline = memory.get("timeline") or []
        recent_timeline = timeline[-3:]
        room_context = event.get("room_context") or []
        active_file = str(event.get("active_file") or "").strip()
        workspace_snapshot = str(event.get("workspace_snapshot") or "").strip()

        return (
            "Current simulation context:\n"
            f"- Event type: {event_type}\n"
            f"- Candidate message: {candidate_message}\n"
            f"- Current phase: {memory.get('phase', 'intro')}\n"
            f"- Last agent: {memory.get('last_agent') or 'none'}\n"
            f"- Candidate plan shared: {memory.get('candidate_plan_shared', False)}\n"
            f"- Asked clarification: {memory.get('asked_clarification', False)}\n"
            f"- Mentioned tradeoff: {memory.get('mentioned_tradeoff', False)}\n"
            f"- Handled crisis: {memory.get('handled_crisis', False)}\n"
            f"- Scores: {scores}\n"
            f"- Recent timeline: {recent_timeline}\n"
            f"- Room context: {room_context[-3:]}\n"
            f"- Active file: {active_file or '(none)'}\n"
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

    def _two_sentences(self, primary: str, secondary: str | None = None) -> str:
        if secondary:
            return f"{primary.strip()} {secondary.strip()}".strip()
        return primary.strip()
