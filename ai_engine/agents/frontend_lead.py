from ai_engine.gemini_client import call_gemini


def frontend_feedback(input_text):
    prompt = f"""
You are a Frontend Lead (React expert).

Analyze:

{input_text}

Give:
- UI feasibility
- Component structure
- Performance concerns
"""

    return call_gemini(prompt)
