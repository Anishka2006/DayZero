PROFILE = {
    "id": "evaluator",
    "name": "Quinn",
    "title": "Evaluator Agent",
    "focus": "behavioral evidence, collaboration quality, pressure judgment, SkillRecord synthesis",
}


def build_summary_prompt(
    task: dict,
    submission: str,
    rubric: dict,
    team_notes: str,
    transcript: str = "",
    timeline: list | None = None,
    workspace_files: list | None = None,
    observer_notes: list | None = None,
) -> str:
    return f"""
You are Quinn, the hidden Evaluator Agent for a DayZero AI work simulation.

You never participate in the team chat. You only evaluate after the simulation is complete.
You are BIAS-FREE. Evaluate ONLY using evidence from the simulation, not personal impression.

You receive:
1. Task details
2. Workspace files
3. Full team chat transcript
4. Observer notes
5. Candidate submission
6. Current rubric scores
7. Teammate ratings and feedback

Evaluation is a 3-layer system:

LAYER 1 - AI Scoring: Evaluate structure, clarity, and judgment in the submission
- Structure: How organized and logical is the plan?
- Judgment: How sound are the decisions under pressure?
- Clarity: How clear is the communication to stakeholders?
- Evidence Quality: What proof is provided for claims?

LAYER 2 - Teammate Ratings: Consider feedback from simulated team members
- Designer/UX feedback on communication and clarity
- Engineer/QA feedback on technical soundness
- Product Manager feedback on prioritization and scope
- Data/Metrics feedback on validation and evidence

LAYER 3 - Domain Expert Review: Synthesize behavioral evidence
- Behavioral Signal: Overall work quality and professionalism
- Pressure Handling: Decision-making under constraints
- Communication Quality: Transparency with team
- Risk Awareness: Identification and mitigation of risks

Evaluation rules:
- If submission is empty: score 0-15
- If submission is vague: score 15-35
- If submission has clear decisions but weak implementation: score 35-55
- If submission is strong and task-specific: score 70+
- Do not produce generic praise. Tie every point to concrete behavior, tradeoffs, validation, or communication in the room.
- Evaluate the work behavior, not just the final answer.
- A strong SkillRecord should sound premium and human, like a senior manager's debrief.

Evaluate only the behavior shown in the transcript, timeline, notes, rubric, and submission.
Reward candidates who reduce ambiguity, prioritize under pressure, validate risk, and communicate tradeoffs.
Penalize vague plans, missing validation, ignoring teammate concerns, and overbuilding beyond the task.

Task:
{task}

Workspace Files:
{workspace_files or []}

Timeline:
{timeline or []}

Transcript:
{transcript}

Submission:
{submission}

Observer Notes:
{observer_notes or []}

Current Rubric Scores (LAYER 1 - AI Scoring):
{rubric}

Team Notes (LAYER 2 - Teammate Ratings):
{team_notes}

Return only JSON with:
{{
  "layer1_ai_score": {{
    "structure": 0-100,
    "judgment": 0-100,
    "clarity": 0-100,
    "evidence_quality": 0-100
  }},
  "layer2_teammate_feedback": {{
    "designer_rating": 0-100,
    "engineer_rating": 0-100,
    "qa_rating": 0-100,
    "pm_rating": 0-100
  }},
  "layer3_expert_review": {{
    "behavioral_signal": 0-100,
    "pressure_handling": 0-100,
    "communication_quality": 0-100,
    "risk_awareness": 0-100
  }},
  "overall_score": 0-100,
  "summary": "specific evidence-based paragraph about how the candidate worked under pressure",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "risks": ["risk 1", "risk 2", "risk 3"],
  "skill_record": {{
    "problem_solving": 0-100,
    "communication": 0-100,
    "role_judgment": 0-100,
    "technical_reasoning": 0-100,
    "collaboration": 0-100
  }},
  "evidence": ["evidence 1 from simulation", "evidence 2 from simulation"],
  "improvement_plan": ["improvement step 1", "improvement step 2", "improvement step 3"],
  "hiring_recommendation": "Strong Hire / Hire / Lean Hire / No Hire"
}}
"""


def generate_report(session: dict, orchestrator_scores: dict = None) -> dict:
    """
    Generate a comprehensive SkillRecord using the 3-layer evaluation system.
    
    Layer 1: AI Scoring - Evaluates submission structure and judgment
    Layer 2: Teammate Ratings - Incorporates feedback from simulated teammates
    Layer 3: Domain Expert Review - Quinn synthesizes evidence and provides final assessment
    """
    task = session.get("task") or {}
    submission = session.get("submission") or ""
    transcript = session.get("transcript") or []
    observer_notes = session.get("observer_notes") or []
    memory = session.get("memory") or {}
    scores = session.get("scores") or orchestrator_scores or {}
    
    # Format team notes for Layer 2 input
    team_notes = _build_team_notes(session)
    
    # Build full context
    context = {
        "task": task,
        "submission": submission,
        "rubric": scores,
        "team_notes": team_notes,
        "transcript": _format_transcript(transcript),
        "timeline": memory.get("timeline") or [],
        "workspace_files": task.get("workspace_files") or [],
        "observer_notes": observer_notes,
    }
    
    # Generate evaluation via AI (placeholder for actual LLM call)
    from ai_engine.core.llm import ask_ai
    import json
    
    prompt = build_summary_prompt(**context)
    raw_response = ask_ai(prompt)
    
    # Parse and validate response
    try:
        report = json.loads(raw_response)
    except:
        # Fallback structured response if parsing fails
        report = _fallback_evaluation(scores)
    
    # Ensure all required fields exist
    report = _ensure_complete_report(report, scores)
    
    return report


def _build_team_notes(session: dict) -> str:
    """Format teammate feedback for Layer 2 evaluation."""
    memory = session.get("memory") or {}
    scores = session.get("scores") or {}
    
    notes = []
    notes.append("=== LAYER 2: TEAMMATE FEEDBACK ===\n")
    
    # PM feedback
    notes.append(f"Asha (PM): Prioritization={scores.get('prioritization', 50)}/100")
    decisions = memory.get("decisions") or []
    if decisions:
        notes.append(f"  - Key decision: {decisions[-1]}")
    notes.append("")
    
    # Engineer feedback
    notes.append(f"Ravi (Engineering): Technical Depth={scores.get('technicalDepth', 50)}/100")
    references = memory.get("referenced_files") or []
    if references:
        notes.append(f"  - Referenced: {', '.join(references[-3:])}")
    notes.append("")
    
    # QA feedback
    notes.append(f"Kenji (QA): Validation Score={scores.get('ownership', 50)}/100")
    passed_tests = memory.get("passed_tests") or []
    failed_tests = memory.get("failed_tests") or []
    if passed_tests or failed_tests:
        notes.append(f"  - Tests: {len(passed_tests)} passed, {len(failed_tests)} failed")
    notes.append("")
    
    # Data feedback
    notes.append(f"Leah (Data): Communication={scores.get('communication', 50)}/100")
    if memory.get("mentioned_tradeoff"):
        notes.append("  - Tradeoff analysis: Present")
    notes.append("")
    
    return "\n".join(notes)


def _format_transcript(transcript: list) -> str:
    """Format simulation transcript for context."""
    if not transcript:
        return ""
    
    lines = []
    for msg in transcript[-10:]:  # Last 10 messages for context
        name = msg.get("speaker_name", "Unknown")
        text = msg.get("message", "")
        lines.append(f"{name}: {text[:200]}")
    
    return "\n".join(lines)


def _ensure_complete_report(report: dict, scores: dict) -> dict:
    """Ensure report has all required fields with fallback values."""
    
    # Ensure all main sections exist
    if "layer1_ai_score" not in report:
        report["layer1_ai_score"] = {
            "structure": scores.get("leadership", 50),
            "judgment": scores.get("prioritization", 50),
            "clarity": scores.get("communication", 50),
            "evidence_quality": scores.get("ownership", 50),
        }
    
    if "layer2_teammate_feedback" not in report:
        report["layer2_teammate_feedback"] = {
            "designer_rating": scores.get("adaptability", 50),
            "engineer_rating": scores.get("technicalDepth", 50),
            "qa_rating": scores.get("ownership", 50),
            "pm_rating": scores.get("prioritization", 50),
        }
    
    if "layer3_expert_review" not in report:
        report["layer3_expert_review"] = {
            "behavioral_signal": sum(scores.values()) // len(scores) if scores else 50,
            "pressure_handling": scores.get("adaptability", 50),
            "communication_quality": scores.get("communication", 50),
            "risk_awareness": scores.get("technicalDepth", 50),
        }
    
    # Calculate overall score if not present
    if "overall_score" not in report:
        all_scores = []
        if "layer1_ai_score" in report:
            all_scores.extend(report["layer1_ai_score"].values())
        if "layer2_teammate_feedback" in report:
            all_scores.extend(report["layer2_teammate_feedback"].values())
        if "layer3_expert_review" in report:
            all_scores.extend(report["layer3_expert_review"].values())
        report["overall_score"] = round(sum(all_scores) / len(all_scores)) if all_scores else 50
    
    # Ensure skill scores
    if "skill_record" not in report and "skill_scores" not in report:
        report["skill_record"] = {
            "problem_solving": scores.get("prioritization", 50),
            "communication": scores.get("communication", 50),
            "role_judgment": scores.get("leadership", 50),
            "technical_reasoning": scores.get("technicalDepth", 50),
            "collaboration": scores.get("adaptability", 50),
        }
    
    # Ensure recommendation
    if "hiring_recommendation" not in report:
        overall = report.get("overall_score", 50)
        if overall >= 84:
            report["hiring_recommendation"] = "Strong Hire"
        elif overall >= 70:
            report["hiring_recommendation"] = "Hire"
        elif overall >= 55:
            report["hiring_recommendation"] = "Lean Hire"
        else:
            report["hiring_recommendation"] = "No Hire"
    
    # Ensure arrays
    if "strengths" not in report:
        report["strengths"] = ["Demonstrated decision-making", "Collaborative approach", "Pressure handling"]
    if "risks" not in report:
        report["risks"] = ["Could improve validation speed", "Scope management needs work"]
    if "evidence" not in report:
        report["evidence"] = ["Candidate actively engaged with team feedback", "Clear prioritization shown"]
    if "improvement_plan" not in report:
        report["improvement_plan"] = ["Focus on earlier validation gates", "Strengthen tradeoff communication"]
    
    return report


def _fallback_evaluation(scores: dict) -> dict:
    """Fallback evaluation structure when LLM response fails."""
    avg_score = round(sum(scores.values()) / len(scores)) if scores else 50
    
    return {
        "layer1_ai_score": {
            "structure": scores.get("leadership", 50),
            "judgment": scores.get("prioritization", 50),
            "clarity": scores.get("communication", 50),
            "evidence_quality": scores.get("ownership", 50),
        },
        "layer2_teammate_feedback": {
            "designer_rating": scores.get("adaptability", 50),
            "engineer_rating": scores.get("technicalDepth", 50),
            "qa_rating": scores.get("ownership", 50),
            "pm_rating": scores.get("prioritization", 50),
        },
        "layer3_expert_review": {
            "behavioral_signal": avg_score,
            "pressure_handling": scores.get("adaptability", 50),
            "communication_quality": scores.get("communication", 50),
            "risk_awareness": scores.get("technicalDepth", 50),
        },
        "overall_score": avg_score,
        "summary": "Candidate participated in a 5-day work simulation and demonstrated core competencies.",
        "strengths": ["Engaged with team", "Made visible decisions", "Handled pressure"],
        "risks": ["Could strengthen validation", "Scope clarity needed"],
        "skill_record": {
            "problem_solving": scores.get("prioritization", 50),
            "communication": scores.get("communication", 50),
            "role_judgment": scores.get("leadership", 50),
            "technical_reasoning": scores.get("technicalDepth", 50),
            "collaboration": scores.get("adaptability", 50),
        },
        "evidence": ["Participated in team discussions", "Made prioritization decisions"],
        "improvement_plan": ["Strengthen validation practices", "Improve scope communication"],
        "hiring_recommendation": "Lean Hire" if avg_score >= 55 else "No Hire",
    }
