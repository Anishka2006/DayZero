from __future__ import annotations

from typing import Any

from ai_engine.core.llm import ask_ai_json

from .base_agent import BaseAgent
from .evaluator import build_summary_prompt


class ObserverAgent(BaseAgent):
    id = "observer"
    name = "Observer"
    role = "Hidden Observer"
    avatar = "O"
    personality = "Silent, analytical, and focused on behavioral evidence rather than theatrics"
    expertise = "Communication, ownership, prioritization, collaboration, adaptability, conflict handling, and clarity under pressure"
    constraints = (
        "Never appear in the simulation UI.",
        "Never speak to the candidate or teammates.",
        "Write compact structured observer notes about behavior and signal quality.",
        "Keep notes concrete and tied to real behavior.",
    )

    def fallback_response(self, event: dict[str, Any], memory: dict[str, Any], scores: dict[str, int]) -> str:
        event_type = self._event_type(event)
        message = self._message_lower(event)

        if event_type == "candidate_introduction":
            return "signal=communication | evidence=candidate shared role context | watch=whether that context turns into a concrete first decision"

        if event_type == "crisis_triggered":
            return "signal=adaptability | evidence=pressure changed during the room | watch=whether the candidate narrows scope and names an owner"

        if event_type == "tests_failed":
            return "signal=risk-awareness | evidence=validation surfaced open issues | watch=whether the candidate names the broken path and retest strategy"

        if event_type == "tests_passed":
            return "signal=execution | evidence=checks improved release confidence | watch=whether residual risk and tradeoffs are explained clearly"

        if event_type == "submit_solution":
            return "signal=handoff | evidence=final submission recorded | watch=whether the final plan shows ownership, prioritization, validation, and calm pressure judgment"

        if event.get("plan_signal_detected"):
            return "signal=leadership | evidence=candidate created a plan signal | watch=whether the plan becomes a concrete decision with a proof point"

        if event.get("tradeoff_signal_detected"):
            return "signal=prioritization | evidence=candidate named scope or tradeoff | watch=whether deferred work is explicit enough for the team"

        if event.get("clarification_signal_detected"):
            return "signal=clarity | evidence=candidate asked for precision instead of bluffing | watch=whether they convert the answer into action"

        if "first" in message or "then" in message or "priority" in message:
            return "signal=leadership | evidence=candidate showed sequencing and structure | watch=whether the sequence includes owner, validation, and cut line"

        if "clarify" in message or "why" in message or "what exactly" in message:
            return "signal=clarity | evidence=candidate asked for precision instead of bluffing | watch=whether they convert the answer into action"

        return "signal=collaboration | evidence=candidate kept the room engaged | watch=whether the next update reduces ambiguity and moves the team toward a decision"

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
        workspace_files = task.get("workspace_files") or task.get("files") or []
        observer_notes = session.get("observer_notes") or []
        
        transcript_tail = "\n".join(
            f"{entry.get('speaker_name', 'Room')}: {entry.get('message', '')}"
            for entry in transcript[-14:]
            if entry.get("message")
        )
        note_text = "\n".join(str(note) for note in observer_notes[-8:])

        prompt = build_summary_prompt(
            task=task,
            submission=submission[:2000],
            rubric=scores,
            team_notes=note_text,
            transcript=transcript_tail,
            timeline=timeline[-8:],
            workspace_files=workspace_files,
            observer_notes=observer_notes,
        )

        data = ask_ai_json(
            prompt=prompt,
            system_prompt=(
                "You are Quinn, the hidden bias-free simulation evaluator for DayZero. "
                "You never participate in the simulation chat. "
                "You are inside DayZero simulation. Only use the active task and active workspace files. Do not invent files, tasks, companies, or requirements. If a file is not listed, do not mention it. "
                "Return only valid JSON."
            ),
            temperature=0.25,
            max_tokens=900,
        )
        if not data:
            return None

        return {
            "overall_score": int(data.get("overall_score") or 0),
            "summary": str(data.get("summary") or "No summary available."),
            "strengths": self._normalize_list(data.get("strengths"), 3, "Strong execution signal observed."),
            "risks": self._normalize_list(data.get("risks") or data.get("weaknesses"), 3, "Residual risk remains unclear."),
            "skill_scores": data.get("skill_scores") or {},
            "evidence": self._normalize_list(data.get("evidence"), 3, "Evidence from simulation."),
            "improvement_plan": self._normalize_list(data.get("improvement_plan") or data.get("next_steps"), 3, "Continue practicing simulations."),
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

        overall_score = int((leadership + communication + technical_depth + prioritization) / 4)

        return {
            "overall_score": overall_score,
            "summary": "The simulation showed how the candidate handled ambiguity, collaboration, and delivery pressure in a live team setting.",
            "recommendation": recommendation,
            "strengths": [
                "Stayed engaged with the team instead of working in isolation.",
                "Created visible signal around priorities, validation, or delivery tradeoffs.",
                "Kept pushing the simulation toward a concrete next step.",
            ],
            "risks": [
                "Some risk areas still need sharper explanation.",
                "The final plan could be more explicit about what is intentionally deferred.",
                "Edge-case validation and residual risk communication can improve.",
            ],
            "skill_scores": {
                "problem_solving": prioritization,
                "communication": communication,
                "role_judgment": leadership,
                "technical_reasoning": technical_depth,
                "collaboration": int((communication + leadership) / 2),
            },
            "evidence": [
                "Candidate maintained active communication with teammates throughout the simulation.",
                "Decisions were made with consideration for team input and task constraints.",
            ],
            "improvement_plan": [
                "State the smallest safe scope earlier when the deadline tightens.",
                "Name the exact validation path after each fix or decision.",
                "Explain what is being cut with the same confidence as what is being shipped.",
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
            if isinstance(item, dict):
                normalized.append({
                    "speaker_name": str(item.get("speaker_name", "Team")),
                    "speaker_title": str(item.get("speaker_title", "Teammate")),
                    "strength": str(item.get("strength", "Strong collaboration")),
                    "risk": str(item.get("risk", "Could clarify some decisions")),
                    "score": int(item.get("score", 70)),
                })
        if not normalized:
            normalized = [
                {
                    "speaker_name": "Asha",
                    "speaker_title": "Product Manager",
                    "strength": "Responded well to structure",
                    "risk": "Could move faster on decisions",
                    "score": 75,
                }
            ]
        return normalized
