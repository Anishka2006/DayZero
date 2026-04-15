from ai_engine.gemini_client import call_gemini


def pm_feedback(input_text):
    prompt = f"""
You are a Project Manager.

Evaluate:

{input_text}

Give:
- Timeline risks
- Scope issues
- Priority suggestions
"""

    return call_gemini(prompt)
