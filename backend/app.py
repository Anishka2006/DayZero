import os
import sys
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ai_engine.core.llm import chat_completion, extract_text, has_openrouter_config
from backend.services.orchestrator import evaluate_work, get_session, handle_agent_event, start_simulation

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend interaction

@app.before_request
def dynamic_api_key_sync():
    api_key = request.headers.get("X-API-Key")
    if api_key:
        masked = api_key[:6] + "..." + api_key[-4:] if len(api_key) > 10 else "..."
        print(f"[Dynamic API Sync] X-API-Key header received: {masked} (length: {len(api_key)})")
        os.environ["OPENROUTER_API_KEY"] = api_key
        os.environ["GROQ_API_KEY"] = api_key

@app.route("/api/chat", methods=["POST"])
def chat() -> tuple:
    incoming = request.get_json(silent=True) or {}

    if "messages" in incoming:
        messages = incoming.get("messages") or []
        model = incoming.get("model")
        max_tokens = int(incoming.get("max_tokens") or 180)
        temperature = float(incoming.get("temperature") or 0.7)
        response_format = incoming.get("response_format")
    else:
        user_message = str(incoming.get("message") or "")
        system_prompt = str(incoming.get("system_prompt") or "You are a helpful assistant.")
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ]
        model = incoming.get("model")
        max_tokens = int(incoming.get("max_tokens") or 180)
        temperature = float(incoming.get("temperature") or 0.7)
        response_format = incoming.get("response_format")

    # Dynamic Routing: If a Groq API key is present in memory, use it to call Groq directly!
    groq_key = os.getenv("GROQ_API_KEY") or ""
    if groq_key.startswith("gsk_"):
        print("[Router] Routing completion request directly to Groq API...")
        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        if response_format:
            payload["response_format"] = response_format

        try:
            import requests as r
            res = r.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {groq_key}",
                    "Content-Type": "application/json"
                },
                json=payload,
                timeout=20
            )
            if res.status_code == 200:
                return jsonify(res.json()), 200
            else:
                print(f"[Router] Groq API returned error: {res.text}")
                return jsonify(res.json()), res.status_code
        except Exception as e:
            print(f"[Router] Failed to connect to Groq API: {str(e)}")
            return jsonify({"error": f"Groq request failed: {str(e)}"}), 500

    # Otherwise, call OpenRouter via default chat_completion
    response = chat_completion(
        messages=messages,
        model=model,
        max_tokens=max_tokens,
        temperature=temperature,
        response_format=response_format,
    )
    if not response:
        return jsonify({"error": "OpenRouter request failed or API key is missing."}), 503

    return jsonify(response), 200


@app.route("/api/simulation/start", methods=["GET", "POST"])
def api_start_simulation() -> tuple:
    payload = request.get_json(silent=True) or {}
    role = request.args.get("role") or payload.get("role")
    task_id = request.args.get("task_id") or payload.get("task_id")
    participant_name = request.args.get("participant_name") or payload.get("participant_name")
    data = start_simulation(task_id=task_id, role=role, participant_name=participant_name)
    return jsonify(data), 200


@app.route("/start-simulation", methods=["POST"])
def legacy_start_simulation() -> tuple:
    payload = request.get_json(silent=True) or {}
    role = payload.get("role")
    task_id = payload.get("task_id")
    participant_name = payload.get("participant_name")
    data = start_simulation(task_id=task_id, role=role, participant_name=participant_name)
    return (
        jsonify(
            {
                "task": data["task_text"],
                "session_id": data["session_id"],
                "task_id": data["task"]["id"],
                "task_data": data["task"],
                "initial_messages": data["initial_messages"],
                "memory": data["memory"],
                "scores": data["scores"],
                "phase": data["phase"],
            }
        ),
        200,
    )


@app.route("/api/sessions", methods=["POST"])
def api_create_session() -> tuple:
    payload = request.get_json(silent=True) or {}
    data = start_simulation(
        task_id=payload.get("task_id"),
        role=payload.get("role"),
        participant_name=payload.get("participant_name"),
    )
    return jsonify(data), 200


@app.route("/api/sessions/<session_id>", methods=["GET"])
def api_get_session(session_id: str) -> tuple:
    session = get_session(session_id)
    if not session:
        return jsonify({"error": "Session not found."}), 404
    return jsonify(session), 200


@app.route("/api/sessions/<session_id>/chat", methods=["POST"])
def api_session_chat(session_id: str) -> tuple:
    payload = request.get_json(silent=True) or {}
    data = handle_agent_event(
        {
            "session_id": session_id,
            "event_type": "candidate_message",
            "candidate_message": payload.get("message"),
            "candidate_name": payload.get("candidate_name"),
            "active_file": payload.get("active_file"),
            "workspace_snapshot": payload.get("workspace_snapshot"),
            "code": payload.get("code"),
        }
    )
    return jsonify(data), 200


@app.route("/api/sessions/<session_id>/tests", methods=["POST"])
def api_session_tests(session_id: str) -> tuple:
    payload = request.get_json(silent=True) or {}
    data = handle_agent_event(
        {
            "session_id": session_id,
            "event_type": "run_tests",
            "candidate_message": payload.get("message") or "I ran the latest checks.",
            "candidate_name": payload.get("candidate_name"),
            "active_file": payload.get("active_file"),
            "workspace_snapshot": payload.get("workspace_snapshot"),
            "code": payload.get("code"),
            "test_results": payload.get("test_results") or {},
        }
    )
    return jsonify(data), 200


@app.route("/api/sessions/<session_id>/submit", methods=["POST"])
def api_session_submit(session_id: str) -> tuple:
    payload = request.get_json(silent=True) or {}
    submission = str(payload.get("submission") or payload.get("code") or "")
    data = handle_agent_event(
        {
            "session_id": session_id,
            "event_type": "submit_solution",
            "candidate_message": submission[:700],
            "candidate_name": payload.get("candidate_name"),
            "active_file": payload.get("active_file"),
            "workspace_snapshot": payload.get("workspace_snapshot"),
            "code": submission,
        }
    )
    return jsonify(data.get("report") or data), 200


@app.route("/api/agent/event", methods=["POST"])
def api_agent_event() -> tuple:
    payload = request.get_json(silent=True) or {}
    data = handle_agent_event(payload)
    return jsonify(data), 200


@app.route("/submit-task", methods=["POST"])
def submit_task() -> tuple:
    payload = request.get_json(silent=True) or {}
    submission = str(payload.get("submission") or "")
    role = str(payload.get("role") or "Frontend")
    session_id = payload.get("session_id")

    if session_id:
        result = handle_agent_event(
            {
                "session_id": session_id,
                "event_type": "submit_solution",
                "candidate_message": submission[:700],
                "code": submission,
                "phase": "submission",
            }
        )
        report = result.get("report") or {}
        return (
            jsonify(
                {
                    "score": report.get("overall_score", 0),
                    "feedback": report.get("summary") or result.get("message") or "",
                    "report": report,
                }
            ),
            200,
        )

    evaluation = evaluate_work(submission=submission, role=role)
    return jsonify(evaluation), 200


@app.route("/api/evaluate", methods=["POST"])
def api_evaluate() -> tuple:
    payload = request.get_json(silent=True) or {}
    submission = str(payload.get("submission") or payload.get("code") or "")
    role = str(payload.get("role") or "Frontend")
    evaluation = evaluate_work(submission=submission, role=role)
    return jsonify(evaluation), 200


@app.route("/api/ping-llm", methods=["GET"])
def ping_llm() -> tuple:
    if not has_openrouter_config():
        return jsonify({"ok": False, "message": "OPENROUTER_API_KEY is missing."}), 200

    response = chat_completion(
        messages=[{"role": "user", "content": "Reply with the single word ready."}],
        max_tokens=10,
        temperature=0,
    )
    if not response:
        return jsonify({"ok": False, "message": "OpenRouter request failed."}), 200

    return jsonify({"ok": True, "reply": extract_text(response) or "ready"}), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)
