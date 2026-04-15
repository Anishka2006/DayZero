from ai_engine.gemini_client import call_gemini


def assign_task():
    prompt = """
You are an AI Manager in a startup.

Assign a Product Manager task:
- Realistic
- Slight ambiguity
- With constraints

Format:
Task:
Context:
Constraints:
"""
    return call_gemini(prompt)


def generate_crisis():
    prompt = """
Introduce a realistic crisis:
- Deadline change OR
- Client issue OR
- Resource constraint

Format:
Crisis:
Impact:
Required Action:
"""
    return call_gemini(prompt)
