from ai_engine.llm import ask_ai
def designer_feedback(prd):
    prompt = f"""
    Review this PRD:

    {prd}

    As a Designer, raise UX concerns.
    """

    return ask_ai(prompt)
