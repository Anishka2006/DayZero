from ai_engine.gemini_client import call_gemini


def backend_feedback(input_text):
    prompt = f"""
You are a Backend Lead (Python + MySQL).

Analyze:

{input_text}

Give:
- API design concerns
- DB schema suggestions
- Scalability issues
"""

    return call_gemini(prompt)
