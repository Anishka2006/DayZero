from __future__ import annotations

from typing import Any

from .base_agent import BaseAgent


class SecurityAgent(BaseAgent):
    id = "security"
    name = "Zara"
    role = "Security Engineer"
    avatar = "Z"
    personality = "Cautious, precise, and focused on attack surfaces"
    expertise = "Vulnerabilities, abuse vectors, auth/session risks, rate limiting, data leaks, permissions"
    allowed_topics = (
        "vulnerabilities",
        "abuse vectors",
        "auth",
        "session risks",
        "rate limiting",
        "data leaks",
        "permissions",
        "security",
        "authentication",
        "authorization",
    )
    avoid_topics = ("visual design", "product positioning", "metric interpretation", "backend architecture ownership")
    speaking_style = "precise, cautious, and threat-focused"
    pressure_style = "pushes for the safest mitigation even when the room wants to move fast"
    constraints = (
        "Talk about vulnerabilities, abuse vectors, auth/session risks, rate limiting, data leaks, permissions.",
        "Never approve a risky change without mitigation.",
        "Push for the smallest safe security mitigation.",
        "Do not make UX, PM, or data decisions unless you are handing off to that teammate.",
        "Mention security risks naturally.",
        "Challenge weak security ideas politely.",
    )

    def fallback_response(self, event: dict[str, Any], memory: dict[str, Any], scores: dict[str, int]) -> str:
        event_type = self._event_type(event)
        message = self._message_lower(event)
        code = self._code(event).lower()
        task = event.get("task") or {}
        task_title = str(task.get("title") or "this task").lower()
        skill_focus = str(event.get("skill_focus") or memory.get("skill_focus") or "").lower()
        focus_file = self._focus_file(event, task, ("auth", "session", "security", "permission", "rate", "limit", "token", "api"))

        if event_type == "candidate_message" and event.get("candidate_introduction_detected"):
            return self._two_sentences(
                "Security is watching for abuse vectors and auth risks.",
                f"For {task_title}, the most sensitive data or permission needs to stay visible.",
            )

        if event_type == "candidate_message" and not memory.get("candidate_introduced"):
            return self._two_sentences(
                f"Start from {focus_file} and the active security boundary.",
                "Smallest safe mitigation matters more than a broad rewrite.",
            )

        if "auth" in message or "token" in message or "session" in message:
            return self._two_sentences(
                f"{focus_file} needs clear session timeout and token revocation paths.",
                "If a token is compromised, we need a fast way to invalidate it.",
            )

        if "permission" in message or "access" in message or "role" in message:
            return self._two_sentences(
                f"The permission model in {focus_file} should follow least privilege.",
                "Default deny is safer than default allow when the system scales.",
            )

        if "rate" in message or "limit" in message or "throttle" in message:
            return self._two_sentences(
                f"Rate limiting in {focus_file} needs to protect against abuse without blocking legit users.",
                "Set per-user and per-IP limits with clear error responses.",
            )

        if "input" in message or "validation" in message or "sanitize" in message:
            return self._two_sentences(
                "Validate and sanitize all inputs before they reach business logic.",
                "Injection risks are easier to prevent at the edge.",
            )

        if "jwt" in code or "token" in code or "auth" in code or "session" in code:
            return self._two_sentences(
                "This is heading the right way.",
                "Just make sure the token has short expiry and secure storage.",
            )

        return self._two_sentences(
            f"From security, I want {focus_file} tightened around auth, permissions, and abuse prevention.",
            "The bypass failure mode should be explicit before signoff.",
        )
