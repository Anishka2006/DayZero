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
        "Offer sequencing, scope, and tradeoff guidance.",
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
        focus_file = self._focus_file(event, task, ("brief", "plan", "scope", "roadmap", "decision"))
        needs_help = any(token in message for token in ("what i have to do", "what do i do", "what should i do", "what to do", "help me", "where to start", "how to start"))
        turn = max(0, int(memory.get("user_message_count", 0)) - 1)
        compact_message = message.strip(" !?.")
        greeting = compact_message in ("hi", "hello", "hey") or compact_message.startswith("hi")
        low_signal = bool(compact_message) and len(compact_message.split()) <= 2 and not greeting

        if needs_help:
            return self._two_sentences(
                f"Start with {focus_file}.",
                f"The task is to stabilize {task.get('title', 'this work')} around the main user impact, then write down what waits.",
            )

        if greeting:
            options = [
                self._two_sentences("Hey, I am here.", f"For {task.get('title', 'this task')}, start with one concrete decision and the thing you are not taking on."),
                self._two_sentences("Still here.", "Give the room one owner, one next step, and one proof point."),
                self._two_sentences("Quick reset.", f"Use {focus_file}, make the first call, and leave the rest out of this pass."),
            ]
            return options[turn % len(options)]

        if low_signal:
            return self._two_sentences(
                "I cannot use that as a plan yet.",
                "Give me one file, blocker, decision, or test result and I will react to the actual work.",
            )

        if event_type == "candidate_message" and event.get("candidate_introduction_detected"):
            greeting = f"Got it, {candidate_name}." if candidate_name else "Got it."
            return self._two_sentences(
                f"{greeting} For {task.get('title', 'this task')}, start with the smallest decision that unblocks the room.",
                "Keep the ship-now path separate from polish or follow-up work.",
            )

        if event_type == "candidate_message" and not memory.get("candidate_introduced") and int(memory.get("user_message_count", 0)) <= 1:
            return self._two_sentences(
                f"Start with the scope call for {task.get('title', 'this task')}.",
                f"{focus_file} should show the broken path; stabilize that first and defer the rest.",
            )

        if event_type == "simulation_start":
            return self._two_sentences(
                f"We are in #{task.get('channel', 'the room')} and the clock is already real: {blocker}.",
                "Start with the smallest useful fix and leave broader cleanup out of this pass.",
            )

        if event_type == "crisis_triggered":
            crisis = event.get("crisis_event") or {}
            crisis_text = crisis.get("message") if isinstance(crisis, dict) else ""
            return self._two_sentences(
                crisis_text or "The time just got tighter, so we are not polishing everything.",
                "Ship the smallest stable path and make the cuts explicit.",
            )

        if "prioritization" in skill_focus:
            return self._two_sentences(
                "Keep the priority call short.",
                f"Put the user-impacting issue in {focus_file} first, then park anything that does not change activation, safety, or release confidence.",
            )

        if "ownership" in skill_focus:
            options = [
                self._two_sentences("Turn this into a clean handoff.", "Name the owner, next action, and proof signal."),
                self._two_sentences("Turn this into an owner-ready update.", "Say who acts next, what they do, and what evidence closes it."),
                self._two_sentences("The room needs a sharper handoff.", "Give the next owner, the next step, and the check that proves it worked."),
            ]
            return options[turn % len(options)]

        if event_type == "tests_passed":
            return self._two_sentences(
                "Good, that helps.",
                "Now call out what is still rough so I can defend the scope.",
            )

        if event_type == "submit_solution":
            return self._two_sentences(
                "This is close, but I still need the tradeoff really clearly.",
                "State what changed now and what is intentionally left out.",
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
            "Put the first move, the cut line, and the safety reason in one clean update.",
        )
