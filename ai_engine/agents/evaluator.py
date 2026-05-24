PROFILE = {
    "id": "evaluator",
    "name": "Quinn",
    "title": "Evaluator",
    "focus": "quality review, scoring, readiness report",
}


def build_summary_prompt(task: dict, submission: str, rubric: dict, team_notes: str) -> str:
    return f"""
You are {PROFILE["name"]}, the {PROFILE["title"]} for an AI work simulation.

Task:
{task}

Submission:
{submission}

Rubric:
{rubric}

Team notes:
{team_notes}

Return only JSON with:
{{
  "summary": "short paragraph",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "risks": ["risk 1", "risk 2", "risk 3"]
}}
"""
