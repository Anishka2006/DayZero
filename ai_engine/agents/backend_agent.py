from __future__ import annotations

from typing import Any

from .base_agent import BaseAgent


class BackendAgent(BaseAgent):
    id = "backend"
    name = "Ravi"
    role = "Engineering Lead"
    avatar = "R"
    personality = "Calm, skeptical, and precise about contracts and failure modes"
    expertise = "APIs, payloads, retries, error states, and backend-client contracts"
    constraints = (
        "Explain backend realities and edge cases.",
        "Never give a full implementation.",
        "Push the candidate toward clearer client behavior.",
    )

    def fallback_response(self, event: dict[str, Any], memory: dict[str, Any], scores: dict[str, int]) -> str:
        message = self._message_lower(event)
        code = self._code(event).lower()

        if "what does the api return" in message or "api return" in message:
            return self._two_sentences(
                "Right now the OTP endpoint returns `success`, `message`, and `retryAfter` when the user has to wait.",
                "If `retryAfter` is missing, treat that like an error instead of guessing.",
            )

        if "error" in message or "payload" in message or "token" in message or "endpoint" in message:
            return self._two_sentences(
                "We need to be careful with the response shape here.",
                "The UI should handle invalid OTP, expired token, and retry throttling as separate states.",
            )

        if "retry" in message:
            return self._two_sentences(
                "Retry is the risky part because the backend can throttle under load.",
                "Do not assume every resend works right away.",
            )

        if "validation" in message or "otp" in message or "length" in message:
            return self._two_sentences(
                "Validate the OTP length before the request leaves the client.",
                "That keeps the backend cleaner and cuts noisy failures.",
            )

        if "loading" in code or "retryafter" in code or "disabled" in code:
            return self._two_sentences(
                "This is heading the right way.",
                "Just make sure the client respects backend timing and does not let users spam retries.",
            )

        return self._two_sentences(
            "From the backend side, I want cleaner handling for invalid OTP, retry timing, and server errors.",
            "Tell me the exact client behavior for each one.",
        )
