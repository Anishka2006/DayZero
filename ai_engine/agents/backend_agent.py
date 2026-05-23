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
    allowed_topics = (
        "APIs",
        "databases",
        "logs",
        "retries",
        "scaling",
        "backend-client contracts",
    )
    avoid_topics = ("visual design choices", "product positioning", "metric interpretation without data")
    speaking_style = "technical, pragmatic, and blunt about failure modes"
    pressure_style = "pushes for the smallest safe technical mitigation"
    constraints = (
        "Explain backend realities and edge cases.",
        "Never give a full implementation.",
        "Give concrete technical next steps.",
        "Do not make UX, PM, or data decisions unless you are handing off to that teammate.",
    )

    def fallback_response(self, event: dict[str, Any], memory: dict[str, Any], scores: dict[str, int]) -> str:
        event_type = self._event_type(event)
        message = self._message_lower(event)
        code = self._code(event).lower()
        task = event.get("task") or {}
        task_title = str(task.get("title") or "this task").lower()
        skill_focus = str(event.get("skill_focus") or memory.get("skill_focus") or "").lower()
        focus_file = self._focus_file(event, task, ("api", "service", "server", "log", "cache", "queue", "auth", "worker"))
        needs_help = any(token in message for token in ("what i have to do", "what do i do", "what should i do", "what to do", "help me", "where to start", "how to start"))

        if needs_help:
            return self._two_sentences(
                f"Start in {focus_file}.",
                "Find the failing success/error path, then make the smallest change that gives QA something concrete to retest.",
            )

        if event_type == "candidate_message" and event.get("candidate_introduction_detected"):
            return self._two_sentences(
                f"For {task_title}, name the riskiest technical assumption first.",
                "Tie it to the API, data flow, or rollback behavior we can verify.",
            )

        if event_type == "candidate_message" and not memory.get("candidate_introduced") and int(memory.get("user_message_count", 0)) <= 1:
            return self._two_sentences(
                f"For {task_title}, get specific about the failure mode first.",
                f"{focus_file} is the best place to check the risky API, data flow, or rollback assumption.",
            )

        if "what does the api return" in message or "api return" in message:
            return self._two_sentences(
                f"{focus_file} needs explicit success, recoverable error, and retry timing fields.",
                "If retry timing is missing, fail safely instead of letting the client guess.",
            )

        if "technical" in skill_focus:
            return self._two_sentences(
                f"For {task_title}, name the technical assumption that can break the plan.",
                "Then make the smallest change that reduces that risk without turning this into a redesign.",
            )

        if "error" in message or "payload" in message or "token" in message or "endpoint" in message:
            return self._two_sentences(
                f"We need to be careful with the response shape in {focus_file}.",
                "The client should treat validation failure, authorization failure, throttling, and server errors as separate states.",
            )

        if "retry" in message:
            return self._two_sentences(
                f"Retry is the risky part in {focus_file} because the backend can throttle under load.",
                "Do not assume every repeated action works right away.",
            )

        if "validation" in message or "input" in message or "length" in message:
            return self._two_sentences(
                "Validate obvious bad input before it leaves the client.",
                "That keeps the backend cleaner and makes the real failures easier to see.",
            )

        if "loading" in code or "retryafter" in code or "disabled" in code or "rollback" in code:
            return self._two_sentences(
                "This is heading the right way.",
                "Just make sure the client respects backend timing and has a clear fallback when the service pushes back.",
            )

        return self._two_sentences(
            f"From backend, I want {focus_file} tightened around success, failure, retry, and rollback behavior.",
            "Write the expected user or system behavior for each one before changing more.",
        )
