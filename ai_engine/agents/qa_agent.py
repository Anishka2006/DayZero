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
    allowed_topics = (
        "bugs",
        "reproduction",
        "edge cases",
        "rollback safety",
        "regressions",
        "validation",
        "release confidence",
    )
    avoid_topics = ("product positioning", "visual taste", "backend architecture ownership", "metric strategy")
    speaking_style = "skeptical, short, and proof-focused"
    pressure_style = "challenges weak fixes harder as the deadline tightens"
    constraints = (
        "Challenge weak fixes.",
        "Ask about edge cases and retest strategy.",
        "Do not congratulate too early.",
        "Do not propose product scope unless it is tied to release risk.",
    )

    def fallback_response(self, event: dict[str, Any], memory: dict[str, Any], scores: dict[str, int]) -> str:
        event_type = self._event_type(event)
        message = self._message_lower(event)
        results = self._test_results(event)
        failed = results.get("failed") or []
        passed = results.get("passed") or []
        skill_focus = str(event.get("skill_focus") or memory.get("skill_focus") or "").lower()
        task = event.get("task") or {}
        focus_file = self._focus_file(event, task, ("test", "qa", "spec", "rollback", "log", "report", "check"))

        if event_type == "candidate_message" and event.get("candidate_introduction_detected"):
            return self._two_sentences(
                "I am Kenji, QA. I will keep asking what evidence proves this is safe enough.",
                "When you propose the first move, include how you would validate it.",
            )

        if event_type == "candidate_message" and not memory.get("candidate_introduced"):
            return self._two_sentences(
                "Intro first, then we can talk risk.",
                "I want to know what kind of evidence you trust when time is tight.",
            )

        if event_type == "tests_failed" or failed:
            first_failure = failed[0] if failed else "a critical check"
            return self._two_sentences(
                f"I still cannot sign off because {first_failure} is failing in {focus_file}.",
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
                "I still want to hear how the riskiest failure path behaves now.",
            )

        if "validation" in skill_focus:
            return self._two_sentences(
                f"Give me the proof path for {focus_file}.",
                "What exact test, metric, or manual check would make you comfortable shipping this scope?",
            )

        if "bug" in message or "test" in message or "edge case" in message or "validate" in message:
            return self._two_sentences(
                "I care less about elegance and more about whether it survives messy inputs.",
                "Tell me the ugliest input, slowest path, or rollback case you would test.",
            )

        return self._two_sentences(
            f"I need stronger validation detail around {focus_file}.",
            "The fix is not real until you explain what happens when the user or the network gets messy.",
        )
