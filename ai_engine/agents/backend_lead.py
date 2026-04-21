from ai_engine.llm import ask_ai
def backend_feedback(prd):
    prompt = f"""
    Review this PRD:

    {prd}

    As a Backend Lead, raise scalability and system concerns.
    """

    return ask_ai(prompt)
