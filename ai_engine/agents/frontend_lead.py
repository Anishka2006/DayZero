from ai_engine.core.llm import ask_ai
def frontend_feedback(prd):
    prompt = f"""
    Review this PRD:

    {prd}

    As a Frontend Lead, raise UI/implementation concerns.
    """

    return ask_ai(prompt)
