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
    allowed_topics = (
        "priorities",
        "deadlines",
        "customer impact",
        "stakeholder alignment",
        "launch risk",
        "scope decisions",
        "owners",
    )
    avoid_topics = ("implementation details", "visual polish", "metric math beyond the decision signal")
    speaking_style = "urgent, plain, and decision-oriented"
    pressure_style = "keeps the room focused on the next call and what gets cut"
    constraints = (
        "Create urgency without sounding robotic.",
        "Ask for sequencing, scope, and tradeoffs.",
        "Never write code.",
        "Do not debug technical implementation; pull in engineering or QA instead.",
    )

    def fallback_response(self, event: dict[str, Any], memory: dict[str, Any], scores: dict[str, int]) -> str:
        event_type = self._event_type(event)
        message = self._message_lower(event)
        task = event.get("task") or {}
        candidate_name = memory.get("candidate_name") or event.get("candidate_name") or ""
        skill_focus = str(event.get("skill_focus") or memory.get("skill_focus") or "").lower()
        room = task.get("room") or {}
        blocker = (room.get("blockers") or ["the main blocker"])[0]

        if event_type == "candidate_message" and event.get("candidate_introduction_detected"):
            greeting = f"Thanks, {candidate_name}." if candidate_name else "Thanks for the intro."
            return self._two_sentences(
                f"{greeting} I am Asha, the product manager keeping scope and deadline honest.",
                "Start by telling us the first decision you want the room aligned on.",
            )

        if event_type == "candidate_message" and not memory.get("candidate_introduced"):
            return self._two_sentences(
                "Before we jump into the work, give us a quick intro.",
                "Share your name, role, and how you usually approach a messy product problem.",
            )

        if event_type == "simulation_start":
            return self._two_sentences(
                f"We are in #{task.get('channel', 'the room')} and the clock is already real: {blocker}.",
                "Tell me what you want to do first.",
            )

        if event_type == "crisis_triggered":
            crisis = event.get("crisis_event") or {}
            crisis_text = crisis.get("message") if isinstance(crisis, dict) else ""
            return self._two_sentences(
                crisis_text or "The time just got tighter, so we are not polishing everything.",
                "Give me the smallest stable path and say what we are cutting.",
            )

        if "prioritization" in skill_focus:
            return self._two_sentences(
                "I need your priority call, not a long list.",
                "What is first, what waits, and what user or business risk makes that the right order?",
            )

        if "ownership" in skill_focus:
            return self._two_sentences(
                "Make the handoff concrete.",
                "Who owns the next action, what changes, and what signal tells us it worked?",
            )

        if event_type == "tests_passed":
            return self._two_sentences(
                "Good, that helps.",
                "Now tell me what is still rough so I can defend the scope.",
            )

        if event_type == "submit_solution":
            return self._two_sentences(
                "This is close, but I still need the tradeoff really clearly.",
                "What did we fix now, and what are we intentionally leaving out?",
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
                "Give me the smallest version we can stand behind for this task.",
            )

        return self._two_sentences(
            "I need a sharper call from you.",
            "Tell the team what happens first, what gets cut, and why the chosen path is safe enough.",
        )
