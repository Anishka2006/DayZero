from ai_engine.agents.designer import designer_feedback
from ai_engine.agents.frontend_lead import frontend_feedback
from ai_engine.agents.backend_lead import backend_feedback
from ai_engine.agents.project_manager import pm_feedback

def run_simulation(user_input):
    responses = {}

    responses["designer"] = designer_feedback(user_input)
    responses["frontend"] = frontend_feedback(user_input)
    responses["backend"] = backend_feedback(user_input)
    responses["pm"] = pm_feedback(user_input)

    return responses
