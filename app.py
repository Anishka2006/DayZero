import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend interaction

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

@app.route('/api/chat', methods=['POST'])
def chat():
    if not GROQ_API_KEY:
        return jsonify({"error": "API Key not configured on server"}), 500

    incoming_data = request.json
    
    # Support both "message/system_prompt" format and direct Groq format
    if "messages" in incoming_data:
        payload = {
            "model": incoming_data.get("model", "llama-3.1-8b-instant"),
            "messages": incoming_data["messages"],
            "max_tokens": incoming_data.get("max_tokens", 150),
            "response_format": incoming_data.get("response_format")
        }
    else:
        user_message = incoming_data.get("message", "")
        system_prompt = incoming_data.get("system_prompt", "You are a helpful assistant.")
        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            "max_tokens": 150
        }

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json=payload,
            timeout=10
        )
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
