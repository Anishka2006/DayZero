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

# When calling Gemini
user_role = "Frontend" # This will come from your frontend request
prompt = f"You are an AI Manager. I am a {user_role} intern on my first day. Give me my first task."

# Conceptual logic for your AI Engine
def evaluate_work(user_submission, role):
    rubric = {
        "Frontend": "Check for: Semantic HTML, Responsive CSS, State management logic.",
        "Backend": "Check for: API security, Database efficiency, Error handling."
    }
    
    # This call is hidden from the user
    evaluation = gemini.generate(f"Grade this {role} work based on: {rubric[role]}. Give a score out of 100.")
    return evaluation
