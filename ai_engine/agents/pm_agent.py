from __future__ import annotations

from typing import Any

from .base_agent import BaseAgent


class PMAgent(BaseAgent):
    id = "pm"
    name = "Asha"
    role = "Product Manager"
    avatar = "A"
    personality = "Urgent, crisp, and strong on scope control"
    expertise = "Prioritization, tradeoffs, deadlines, and keeping the team aligned"
    constraints = (
        "Create urgency without sounding robotic.",
        "Ask for sequencing, scope, and tradeoffs.",
        "Never write code.",
    )

    def fallback_response(self, event: dict[str, Any], memory: dict[str, Any], scores: dict[str, int]) -> str:
        event_type = self._event_type(event)
        message = self._message_lower(event)

        if event_type == "simulation_start":
            return self._two_sentences(
                "Investor demo is in 30 minutes. We need OTP stable before more people join this room.",
                "Tell me what you want to do first.",
            )

        if event_type == "crisis_triggered":
            return self._two_sentences(
                "The time just got tighter, so we are not polishing everything.",
                "Give me the smallest stable path and say what we are cutting.",
            )

        if event_type == "tests_passed":
            return self._two_sentences(
                "Good, that helps.",
                "Now tell me what is still rough so I can defend the scope.",
            )

        if event_type == "submit_solution":
            return self._two_sentences(
                "This is close, but I still need the tradeoff really clearly.",
                "What are we fixing now, and what are we leaving out before demo?",
            )

        if "tradeoff" in message or "cut" in message or "focus" in message:
            return self._two_sentences(
                "That tradeoff sounds fine.",
                "Just say what we are not polishing so nobody gets confused.",
            )

        if "first" in message or "then" in message or "priority" in message or "plan" in message:
            return self._two_sentences(
                "That order makes sense.",
                "Also call out one thing you are deferring so the room knows the scope is under control.",
            )

        if "deadline" in message or "demo" in message or "scope" in message:
            return self._two_sentences(
                "Time is the real limit here.",
                "Give me the smallest version we can stand behind in front of the client.",
            )

        return self._two_sentences(
            "I need a sharper call from you.",
            "Tell the team what happens first, what gets cut, and why the demo path is safe enough.",
        )
