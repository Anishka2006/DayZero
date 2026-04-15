from ai_engine.gemini_client import call_gemini


def designer_feedback(input_text):
    prompt = f"""
You are a Senior Product Designer.

Review the following PRD:

{input_text}
Give:
- UX issues
- Missing flows
- Suggestions
"""

    return call_gemini(prompt)
