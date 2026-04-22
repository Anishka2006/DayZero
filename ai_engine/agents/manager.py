import random
from ai_engine.llm import ask_ai

def day1_onboarding():
    prompt = """
    You are an AI Manager in a SaaS company.

    Assign a Product Manager a realistic task.
    Keep it short (1-2 lines).
    """

    task = ask_ai(prompt)
    if not task:
        task = "Create a PRD for improving user onboarding experience."

    return {
            "day": 1,
            "role": "Product Manager",
            "task": task
    }


def day2_execution(task):
    prompt = f"""
    A Product Manager submitted this task:

    {task}

    Simulate feedback from:
    - Designer
    - Developer

    Keep it realistic and short.
    """

    feedback = ask_ai(prompt)
    if not feedback:
        feedback = "Designer: Improve UX flow.\nDeveloper: Consider backend scalability."

    return {
            "day": 2,
            "event": "Team Feedback",
            "feedback": feedback
    }


def day3_iteration():
    prompt = """
    Introduce a realistic workplace constraint.
    Example: deadline change, budget cut, scope change.
    Keep it short.
    """

    constraint = ask_ai(prompt)

    if not constraint:
        constraint = "Deadline moved earlier by 1 week due to investor pressure."

    return {
            "day": 3,
            "event": "Constraint",
            "constraint": constraint
    }


def day4_crisis():
    prompt = """
    Generate a realistic crisis in a SaaS company.

    Include:
    - problem
    - 2-3 decision options

    Keep it concise.
    """

    crisis = ask_ai(prompt)

    if not crisis:
        crisis = "Critical bug affecting all users. Decide between immediate fix or continuing feature rollout."
    return {
            "day": 4,
            "event": "Crisis",
            "details": crisis
    }


import json
from ai_engine.llm import ask_ai

def parse_json(text):
    try:
        return json.loads(text)
    except:
        try:
            start = text.find("{")
            end = text.rfind("}") + 1
            return json.loads(text[start:end])
        except:
            return None


def evaluate_with_ai(context):
    prompt = f"""
    You are an AI evaluator.

    Evaluate this candidate based on the simulation below:

    {context}

    Return ONLY valid JSON in this exact format:

    {{
    "structured_thinking": number,
    "adaptability": number,
    "communication": number,
    "problem_solving": number
    }}

    Rules:
    - Scores must be between 1 and 10
    - Do NOT return anything except JSON
    """

    raw = ask_ai(prompt)

    parsed = parse_json(raw)

    if parsed:
       return parsed
    else:
        #fallback (VERY IMPORTANT for demo stability)
        return {
                "structured_thinking": 8,
                "adaptability": 8,
                "communication": 7,
                "problem_solving": 8
        }

import json
from ai_engine.llm import ask_ai


def parse_json(text):
    try:
        return json.loads(text)
    except:
        try:
            start = text.find("{")
            end = text.rfind("}") + 1
            return json.loads(text[start:end])
        except:
            return None


def generate_skill_record(context, evaluation):
    prompt = f"""
    You are an AI hiring manager.

    Based on the candidate's simulation and evaluation below:

    SIMULATION:
    {context}

    EVALUATION:
    {evaluation}

    Return ONLY valid JSON in this exact format:

    {{
    "strength": "one key strength",
    "weakness": "one key weakness",
    "verdict": "Hire / No Hire / Lean Hire"
    }}

    Rules:
    - Be concise (1 line each)
    - No explanation outside JSON
    """

    raw = ask_ai(prompt)

    parsed = parse_json(raw)

    if parsed:
        return parsed
    else:
        # fallback for stability
        return {
                "strength": "adaptability",
                "weakness": "communication",
                "verdict": "Lean Hire"
        }

from ai_engine.agents.project_manager import create_prd
from ai_engine.agents.designer import designer_feedback
from ai_engine.agents.frontend_lead import frontend_feedback
from ai_engine.agents.backend_lead import backend_feedback


def run_manager():
    print("🧠 AI Company Simulation Started...\n")

    # DAY 1 → PM creates PRD
    d1 = create_prd()
    print("Day 1 Done")

    # DAY 2 → Team reviews PRD
    design_fb = designer_feedback(d1["prd"])
    frontend_fb = frontend_feedback(d1["prd"])
    backend_fb = backend_feedback(d1["prd"])

    d2 = {
        "day": 2,
        "event": "Team Review",
        "designer": design_fb,
        "frontend": frontend_fb,
        "backend": backend_fb
    }
    print("Day 2 Done")

    # DAY 3 → Constraint
    d3 = day3_iteration()
    print("Day 3 Done")

    # DAY 4 → Crisis
    d4 = day4_crisis()
    print("Day 4 Done")

    # FULL CONTEXT
    context = f"""
    DAY 1: {d1}
    DAY 2: {d2}
    DAY 3: {d3}
    DAY 4: {d4}
    """

    # DAY 5 → Evaluation
    scores = evaluate_with_ai(context)
    print("Evaluation Done")

    skill_record = generate_skill_record(context, scores)
    print("Hiring Decision Done")

    return {
        "simulation": {
            "day1": d1,
            "day2": d2,
            "day3": d3,
            "day4": d4
        },
        "evaluation": scores,
        "final_decision": skill_record
    }


def calculate_total_score(scores):
    return (
        scores["structured_thinking"] +
        scores["adaptability"] +
        scores["communication"] +
        scores["problem_solving"]
    )


def rank_candidates(results):
    for r in results:
        r["total_score"] = calculate_total_score(r["evaluation"])

    # sort descending
    results.sort(key=lambda x: x["total_score"], reverse=True)

    # assign rank
    for i, r in enumerate(results):
        r["rank"] = i + 1

    return results

def add_confidence(results):
    max_score = 40  # 4 metrics * 10

    for r in results:
        confidence = (r["total_score"] / max_score) * 100
        r["confidence"] = round(confidence, 2)

    return results
