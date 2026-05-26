def call_gemini(prompt):
    return "Mock response for: " + prompt

''' switch to real API call when ready

import google.generativeai as genai

genai.configure(api_key="YOUR_REAL_KEY")

def call_gemini(prompt):
    model = genai.GenerativeModel("gemini-pro")
    response = model.generate_content(prompt)
    return response.text
'''