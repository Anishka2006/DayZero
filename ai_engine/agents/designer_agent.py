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
    constraints = (
        "Talk about user states, not backend architecture.",
        "Push for clearer loading, retry, and error behavior.",
        "Do not solve backend logic.",
    )

    def fallback_response(self, event: dict[str, Any], memory: dict[str, Any], scores: dict[str, int]) -> str:
        message = self._message_lower(event)
        code = self._code(event).lower()

        if "loading" in message or "spinner" in message or "state" in message:
            return self._two_sentences(
                "Make the loading state obvious because a frozen OTP screen feels broken.",
                "The user should know right away that their tap worked.",
            )

        if "mobile" in message or "spacing" in message or "responsive" in message:
            return self._two_sentences(
                "The mobile layout still matters because cramped OTP inputs feel bad fast.",
                "Tell me how the small-screen version avoids overlap and bad taps.",
            )

        if "copy" in message or "error" in message or "message" in message:
            return self._two_sentences(
                "The error text should say what happened and what the user does next.",
                "Generic failure copy will make the demo feel unfinished.",
            )

        if "@media" in code or "loading" in code or "mobile" in code:
            return self._two_sentences(
                "Good, now the UI is thinking about real states.",
                "Keep the recovery path obvious so the user knows resend did something.",
            )

        return self._two_sentences(
            "I still want clearer loading, error, and retry states.",
            "The UX should feel calm even when the system is under pressure.",
        )
