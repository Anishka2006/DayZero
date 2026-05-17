from __future__ import annotations

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
from backend.services.orchestrator import (
    evaluate_work,
    get_session,
    handle_agent_event,
    start_simulation,
)

load_dotenv()

app = Flask(__name__)
CORS(app)

DEFAULT_FAST_MAX_TOKENS = 160


@app.route("/", methods=["GET"])
def home():
    return jsonify({"ok": True, "message": "DayZero backend running"}), 200


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "ok": True,
        "openrouter_configured": has_openrouter_config()
    }), 200


@app.route("/api/chat", methods=["POST"])
def chat():
    incoming = request.get_json(silent=True) or {}

    if "messages" in incoming:
        messages = incoming.get("messages") or []
    else:
        user_message = str(incoming.get("message") or "")
        system_prompt = str(incoming.get("system_prompt") or "You are a helpful assistant.")
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ]

    response = chat_completion(
        messages=messages,
        model=incoming.get("model"),
        max_tokens=int(incoming.get("max_tokens") or DEFAULT_FAST_MAX_TOKENS),
        temperature=float(incoming.get("temperature") or 0.6),
        response_format=incoming.get("response_format"),
        timeout=12,
    )

    if not response:
        return jsonify({"error": "OpenRouter request failed or API key missing."}), 503

    return jsonify(response), 200


@app.route("/api/simulation/start", methods=["GET", "POST"])
def api_start_simulation():
    payload = request.get_json(silent=True) or {}

    data = start_simulation(
        task_id=request.args.get("task_id") or payload.get("task_id"),
        role=request.args.get("role") or payload.get("role"),
        participant_name=request.args.get("participant_name") or payload.get("participant_name"),
        task_context=payload.get("task_context"),
    )

    return jsonify(data), 200


@app.route("/start-simulation", methods=["POST"])
def legacy_start_simulation():
    payload = request.get_json(silent=True) or {}

    data = start_simulation(
        task_id=payload.get("task_id"),
        role=payload.get("role"),
        participant_name=payload.get("participant_name"),
        task_context=payload.get("task_context"),
    )

    return jsonify({
        "task": data.get("task_text"),
        "session_id": data.get("session_id"),
        "task_id": data.get("task", {}).get("id"),
        "task_data": data.get("task"),
        "initial_messages": data.get("initial_messages"),
        "memory": data.get("memory"),
        "scores": data.get("scores"),
        "phase": data.get("phase"),
    }), 200


@app.route("/api/sessions", methods=["POST"])
def api_create_session():
    payload = request.get_json(silent=True) or {}

    data = start_simulation(
        task_id=payload.get("task_id"),
        role=payload.get("role"),
        participant_name=payload.get("participant_name"),
        task_context=payload.get("task_context"),
    )

    return jsonify(data), 200


@app.route("/api/sessions/<session_id>", methods=["GET"])
def api_get_session(session_id: str):
    session = get_session(session_id)

    if not session:
        return jsonify({"error": "Session not found."}), 404

    return jsonify(session), 200


@app.route("/api/sessions/<session_id>/chat", methods=["POST"])
def api_session_chat(session_id: str):
    payload = request.get_json(silent=True) or {}

    data = handle_agent_event({
        "session_id": session_id,
        "event_type": "candidate_message",
        "candidate_message": payload.get("message"),
        "candidate_name": payload.get("candidate_name"),
        "active_file": payload.get("active_file"),
        "workspace_snapshot": payload.get("workspace_snapshot"),
        "code": payload.get("code"),
    })

    return jsonify(data), 200


@app.route("/api/sessions/<session_id>/tests", methods=["POST"])
def api_session_tests(session_id: str):
    payload = request.get_json(silent=True) or {}

    data = handle_agent_event({
        "session_id": session_id,
        "event_type": "run_tests",
        "candidate_message": payload.get("message") or "I ran the latest checks.",
        "candidate_name": payload.get("candidate_name"),
        "active_file": payload.get("active_file"),
        "workspace_snapshot": payload.get("workspace_snapshot"),
        "code": payload.get("code"),
        "test_results": payload.get("test_results") or {},
    })

    return jsonify(data), 200


@app.route("/api/sessions/<session_id>/submit", methods=["POST"])
def api_session_submit(session_id: str):
    payload = request.get_json(silent=True) or {}
    submission = str(payload.get("submission") or payload.get("code") or "")

    data = handle_agent_event({
        "session_id": session_id,
        "event_type": "submit_solution",
        "candidate_message": submission[:500],
        "candidate_name": payload.get("candidate_name"),
        "active_file": payload.get("active_file"),
        "workspace_snapshot": payload.get("workspace_snapshot"),
        "code": submission,
    })

    return jsonify(data.get("report") or data), 200


@app.route("/api/agent/event", methods=["POST"])
def api_agent_event():
    payload = request.get_json(silent=True) or {}
    data = handle_agent_event(payload)
    return jsonify(data), 200


@app.route("/submit-task", methods=["POST"])
def submit_task():
    payload = request.get_json(silent=True) or {}

    submission = str(payload.get("submission") or "")
    role = str(payload.get("role") or "Frontend")
    session_id = payload.get("session_id")

    if session_id:
        result = handle_agent_event({
            "session_id": session_id,
            "event_type": "submit_solution",
            "candidate_message": submission[:500],
            "code": submission,
            "phase": "submission",
        })

        report = result.get("report") or {}

        return jsonify({
            "score": report.get("overall_score", 0),
            "feedback": report.get("summary") or result.get("message") or "",
            "report": report,
        }), 200

    evaluation = evaluate_work(submission=submission, role=role)
    return jsonify(evaluation), 200


@app.route("/api/evaluate", methods=["POST"])
def api_evaluate():
    payload = request.get_json(silent=True) or {}

    submission = str(payload.get("submission") or payload.get("code") or "")
    role = str(payload.get("role") or "Frontend")

    evaluation = evaluate_work(submission=submission, role=role)
    return jsonify(evaluation), 200


@app.route("/api/ping-llm", methods=["GET"])
def ping_llm():
    if not has_openrouter_config():
        return jsonify({
            "ok": False,
            "message": "OPENROUTER_API_KEY is missing."
        }), 200

    response = chat_completion(
        messages=[{"role": "user", "content": "Reply with the single word ready."}],
        max_tokens=5,
        temperature=0,
        timeout=8,
    )

    if not response:
        return jsonify({"ok": False, "message": "OpenRouter request failed."}), 200

    return jsonify({
        "ok": True,
        "reply": extract_text(response) or "ready"
    }), 200


if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
