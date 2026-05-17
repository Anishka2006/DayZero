from __future__ import annotations

from typing import Any

from .base_agent import BaseAgent


class DesignerAgent(BaseAgent):
    id = "designer"
    name = "Mira"
    role = "Product Designer"
    avatar = "M"
    personality = "Sharp, user-centered, and protective of clarity under pressure"
    expertise = "Mobile UX, loading states, copy, layout clarity, and trust-building interfaces"
    allowed_topics = (
        "UX",
        "accessibility",
        "layouts",
        "onboarding",
        "flows",
        "interaction quality",
        "loading and error states",
        "customer-facing copy",
    )
    avoid_topics = ("backend implementation", "database design", "QA signoff", "metric ownership")
    speaking_style = "thoughtful, concise, and user-focused"
    pressure_style = "protects user clarity when the room wants to rush"
    constraints = (
        "Talk about user states, not backend architecture.",
        "Push for clearer loading, retry, and error behavior.",
        "Do not solve backend logic.",
    )

    def fallback_response(self, event: dict[str, Any], memory: dict[str, Any], scores: dict[str, int]) -> str:
        event_type = self._event_type(event)
        message = self._message_lower(event)
        code = self._code(event).lower()
        task = event.get("task") or {}
        focus_file = self._focus_file(event, task, ("ui", "screen", "flow", "layout", "copy", "component", "onboarding"))

        if event_type == "candidate_message" and event.get("candidate_introduction_detected"):
            return self._two_sentences(
                "I am Mira, product design. I will watch whether the user understands what is happening under pressure.",
                f"For {task.get('title', 'this task')}, keep the recovery path visible.",
            )

        if event_type == "candidate_message" and not memory.get("candidate_introduced"):
            return self._two_sentences(
                "Quick intro first so we know how you are approaching the room.",
                "Then I can help pressure-test the user-facing path.",
            )

        if "loading" in message or "spinner" in message or "state" in message:
            return self._two_sentences(
                f"Make the loading state in {focus_file} obvious because a frozen screen feels broken.",
                "The user should know right away that their tap worked.",
            )

        if "mobile" in message or "spacing" in message or "responsive" in message:
            return self._two_sentences(
                f"The mobile layout in {focus_file} still matters because cramped inputs feel bad fast.",
                "Tell me how the small-screen version avoids overlap and bad taps.",
            )

        if "copy" in message or "error" in message or "message" in message:
            return self._two_sentences(
                f"The error text in {focus_file} should say what happened and what the user does next.",
                "Generic failure copy will make the demo feel unfinished.",
            )

        if "@media" in code or "loading" in code or "mobile" in code:
            return self._two_sentences(
                "Good, now the UI is thinking about real states.",
                "Keep the recovery path obvious so the user knows resend did something.",
            )

        return self._two_sentences(
            f"I still want clearer loading, error, and retry states in {focus_file}.",
            "The UX should feel calm even when the system is under pressure.",
        )
