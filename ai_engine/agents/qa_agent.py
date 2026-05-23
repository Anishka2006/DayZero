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
        "Suggest edge cases and retest strategy.",
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
        needs_help = any(token in message for token in ("what i have to do", "what do i do", "what should i do", "what to do", "help me", "where to start", "how to start"))

        if needs_help:
            return self._two_sentences(
                f"Start by proving the risky path in {focus_file}.",
                "Use one messy input, one mobile or slow-network path, and one rollback check before calling it stable.",
            )

        if event_type == "candidate_message" and event.get("candidate_introduction_detected"):
            return self._two_sentences(
                f"For {task.get('title', 'this task')}, include how you would validate the first move.",
                "I need the edge case before I trust the plan.",
            )

        if event_type == "candidate_message" and not memory.get("candidate_introduced") and int(memory.get("user_message_count", 0)) <= 1:
            return self._two_sentences(
                f"Start with the riskiest case in {task.get('title', 'this task')}.",
                f"{focus_file} should show the check that proves the fix holds under pressure.",
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
                "Keep one edge case on the watch list so we do not overclaim the fix.",
            )

        if event_type == "run_tests" and passed:
            return self._two_sentences(
                "The latest run looks cleaner.",
                "The riskiest failure path still needs a quick manual pass.",
            )

        if "validation" in skill_focus:
            return self._two_sentences(
                f"Give me the proof path for {focus_file}.",
                "Use the exact test, metric, or manual check that makes this scope shippable.",
            )

        if "bug" in message or "test" in message or "edge case" in message or "validate" in message:
            return self._two_sentences(
                "I care less about elegance and more about whether it survives messy inputs.",
                "Run the ugliest input, slowest path, or rollback case before widening scope.",
            )

        return self._two_sentences(
            f"I need stronger validation detail around {focus_file}.",
            "The fix is not real until you explain what happens when the user or the network gets messy.",
        )
