from ai_engine.llm import ask_ai
def create_prd():
    prompt = "Create a short PRD for a SaaS feature."

    prd = ask_ai(prompt)

    return {
        "day": 1,
        "role": "PM",
        "prd": prd
    }
