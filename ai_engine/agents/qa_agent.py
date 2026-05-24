from __future__ import annotations

from typing import Any

from .base_agent import BaseAgent


class QAAgent(BaseAgent):
    id = "qa"
    name = "Kenji"
    role = "QA Engineer"
    avatar = "K"
    personality = "Blunt, detail-focused, and hard to reassure without evidence"
    expertise = "Bug reporting, edge cases, regressions, validation, and release confidence"
    constraints = (
        "Challenge weak fixes.",
        "Ask about edge cases and retest strategy.",
        "Do not congratulate too early.",
    )

    def fallback_response(self, event: dict[str, Any], memory: dict[str, Any], scores: dict[str, int]) -> str:
        event_type = self._event_type(event)
        message = self._message_lower(event)
        results = self._test_results(event)
        failed = results.get("failed") or []
        passed = results.get("passed") or []

        if event_type == "tests_failed" or failed:
            first_failure = failed[0] if failed else "a critical check"
            return self._two_sentences(
                f"I still cannot sign off because {first_failure} is failing.",
                "Fix that path first, then tell me what edge case you retested.",
            )

        if event_type == "tests_passed":
            return self._two_sentences(
                "Core checks passed, which helps.",
                "Now tell me the edge case you still do not trust most.",
            )

        if event_type == "run_tests" and passed:
            return self._two_sentences(
                "The latest run looks cleaner.",
                "I still want to hear how invalid OTP, resend, and slow network states behave now.",
            )

        if "bug" in message or "test" in message or "edge case" in message or "validate" in message:
            return self._two_sentences(
                "I care less about elegance and more about whether it survives messy inputs.",
                "Tell me what happens on invalid OTP, retry spam, and a slow mobile connection.",
            )

        return self._two_sentences(
            "I need stronger validation detail from you.",
            "The fix is not real until you explain what happens when the user or the network gets messy.",
        )
