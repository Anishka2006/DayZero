from __future__ import annotations

from typing import Any

from ai_engine.core.llm import ask_ai_json

from .base_agent import BaseAgent


class ObserverAgent(BaseAgent):
    id = "observer"
    name = "Nova"
    role = "Recruiter Observer"
    avatar = "N"
    personality = "Quiet, analytical, and focused on hiring signals rather than theatrics"
    expertise = "Behavioral analysis, hiring recommendations, and performance synthesis"
    constraints = (
        "Do not speak to the candidate directly in the team room.",
        "Write short observer notes about behavior and signal quality.",
        "Keep notes concrete and tied to real behavior.",
    )

    def fallback_response(self, event: dict[str, Any], memory: dict[str, Any], scores: dict[str, int]) -> str:
        event_type = self._event_type(event)
        message = self._message_lower(event)

        if event_type == "crisis_triggered":
            return "Adaptability signal increased when the candidate engaged with time pressure instead of freezing."

        if event_type == "tests_failed":
            return "Technical depth is still forming. The next useful signal is whether the candidate can name the broken path and retest strategy."

        if event_type == "tests_passed":
            return "Execution credibility improved. The next differentiator is whether the candidate can explain tradeoffs and residual risk."

        if event_type == "submit_solution":
            return "Submission recorded. Final recommendation should weigh communication, prioritization, ownership, adaptability, and technical judgment together."

        if "first" in message or "then" in message or "priority" in message:
            return "Candidate showed sequencing and structure, which is a positive leadership and communication signal."

        if "clarify" in message or "why" in message or "what exactly" in message:
            return "Candidate asked for precision instead of bluffing, which supports communication quality and technical depth."

        return "Observer is tracking whether the candidate reduces ambiguity, handles pressure, and moves the team toward a clearer decision."

    def generate_report(self, session: dict[str, Any]) -> dict[str, Any]:
        llm_report = self._generate_report_with_llm(session)
        if llm_report:
            return llm_report
        return self._fallback_report(session)

    def _generate_report_with_llm(self, session: dict[str, Any]) -> dict[str, Any] | None:
        task = session.get("task") or {}
        scores = session.get("scores") or {}
        timeline = session.get("memory", {}).get("timeline") or []
        transcript = session.get("transcript") or []
        submission = session.get("submission") or ""

        prompt = (
            "You are Nova, the hidden recruiter observer inside DayZero.\n"
            "Generate a final simulation report as valid JSON.\n"
            "Use this structure exactly:\n"
            "{"
            '"summary": string, '
            '"recommendation": string, '
            '"strengths": [string, string, string], '
            '"weaknesses": [string, string, string], '
            '"next_steps": [string, string, string], '
            '"team_notes": ['
            '{"speaker_name": string, "speaker_title": string, "strength": string, "risk": string, "score": number}, '
            '{"speaker_name": string, "speaker_title": string, "strength": string, "risk": string, "score": number}'
            "]"
            "}\n\n"
            f"Task: {task}\n"
            f"Scores: {scores}\n"
            f"Timeline: {timeline[-8:]}\n"
            f"Transcript tail: {transcript[-10:]}\n"
            f"Submission: {submission[:2000]}\n\n"
            "Ground the report in the actual simulation behavior. Be concise, credible, and startup-grade."
        )

        data = ask_ai_json(
            prompt=prompt,
            system_prompt=(
                "You are an expert recruiter observer summarizing a realistic work simulation. "
                "Return only valid JSON."
            ),
            temperature=0.25,
            max_tokens=900,
        )
        if not data:
            return None

        return {
            "summary": str(data.get("summary") or "No summary available."),
            "recommendation": str(data.get("recommendation") or "No recommendation available."),
            "strengths": self._normalize_list(data.get("strengths"), 3, "Strong execution signal observed."),
            "weaknesses": self._normalize_list(data.get("weaknesses"), 3, "Residual risk remains unclear."),
            "next_steps": self._normalize_list(data.get("next_steps"), 3, "Clarify remaining risk before ship."),
            "team_notes": self._normalize_team_notes(data.get("team_notes")),
        }

    def _fallback_report(self, session: dict[str, Any]) -> dict[str, Any]:
        scores = session.get("scores") or {}
        leadership = int(scores.get("leadership", 50))
        communication = int(scores.get("communication", 50))
        technical_depth = int(scores.get("technicalDepth", 50))
        prioritization = int(scores.get("prioritization", 50))

        recommendation = "Strong hire"
        if min(leadership, communication, technical_depth) < 58:
            recommendation = "Mixed signals"
        if min(leadership, communication, technical_depth, prioritization) < 45:
            recommendation = "Needs more evidence"

        return {
            "summary": "The simulation showed how the candidate handled ambiguity, collaboration, and delivery pressure in a live team setting.",
            "recommendation": recommendation,
            "strengths": [
                "Stayed engaged with the team instead of working in isolation.",
                "Created visible signal around priorities, validation, or delivery tradeoffs.",
                "Kept pushing the simulation toward a concrete next step.",
            ],
            "weaknesses": [
                "Some risk areas still need sharper explanation.",
                "The final plan could be more explicit about what is intentionally deferred.",
                "Edge-case validation and residual risk communication can improve.",
            ],
            "next_steps": [
                "State the smallest safe scope earlier when the deadline tightens.",
                "Name the exact validation path after each fix or decision.",
                "Explain what is being cut with the same confidence as what is being shipped.",
            ],
            "team_notes": [
                {
                    "speaker_name": "Asha",
                    "speaker_title": "Product Manager",
                    "strength": "Responded best when the candidate showed sequencing and tradeoffs.",
                    "risk": "Still needed a clearer statement about what was being cut under time pressure.",
                    "score": max(55, min(96, prioritization)),
                },
                {
                    "speaker_name": "Kenji",
                    "speaker_title": "QA Engineer",
                    "strength": "Confidence improved when the candidate acknowledged edge cases and retesting.",
                    "risk": "Execution felt weaker whenever validation details stayed vague.",
                    "score": max(50, min(96, technical_depth)),
                },
            ],
        }

    def _normalize_list(self, value: Any, size: int, fallback_item: str) -> list[str]:
        items = value if isinstance(value, list) else []
        normalized = [str(item).strip() for item in items if str(item).strip()]
        if not normalized:
            normalized = [fallback_item]
        while len(normalized) < size:
            normalized.append(normalized[-1])
        return normalized[:size]

    def _normalize_team_notes(self, value: Any) -> list[dict[str, Any]]:
        notes = value if isinstance(value, list) else []
        normalized: list[dict[str, Any]] = []
        for item in notes[:4]:
            if not isinstance(item, dict):
                continue
            normalized.append(
                {
                    "speaker_name": str(item.get("speaker_name") or "AI Teammate"),
                    "speaker_title": str(item.get("speaker_title") or "Simulation Observer"),
                    "strength": str(item.get("strength") or "Provided a useful signal."),
                    "risk": str(item.get("risk") or "Risk note unavailable."),
                    "score": int(item.get("score") or 70),
                }
            )

        if normalized:
            return normalized

        return [
            {
                "speaker_name": "Nova",
                "speaker_title": "Recruiter Observer",
                "strength": "Tracked the candidate's collaboration and delivery signals throughout the simulation.",
                "risk": "Final report fell back to rule-based synthesis because the LLM response was unavailable.",
                "score": 72,
            }
        ]
