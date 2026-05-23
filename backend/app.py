from __future__ import annotations

import os
import sys
import logging
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ai_engine.core.llm import chat_completion, extract_text, has_groq_config
from backend.services.orchestrator import (
    evaluate_work,
    get_session,
    handle_agent_event,
    start_simulation,
)
from backend.services.db import (
    get_skill_record,
    create_submission,
    get_session as db_get_session,
    save_observer_note,
    get_observer_notes,
)

load_dotenv()

logging.basicConfig(
    level=os.getenv("DAYZERO_LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    force=True,
)

app = Flask(__name__)
app.logger.setLevel(os.getenv("DAYZERO_LOG_LEVEL", "INFO").upper())
CORS(app)

DEFAULT_FAST_MAX_TOKENS = 160


def _preview(value: object, limit: int = 140) -> str:
    text = str(value or "").replace("\n", " ").strip()
    return text[:limit] + ("..." if len(text) > limit else "")


@app.route("/", methods=["GET"])
def home():
    return jsonify({"ok": True, "message": "DayZero backend running"}), 200


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "ok": True,
        "groq_configured": has_groq_config()
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
        app.logger.warning(
            "api_chat provider=groq status=failed model=%s messages=%s",
            incoming.get("model") or "default",
            len(messages),
        )
        return jsonify({"error": "Groq request failed or API key missing."}), 503

    app.logger.info(
        "api_chat provider=groq status=ok model=%s messages=%s reply_chars=%s",
        response.get("model") or incoming.get("model") or "default",
        len(messages),
        len(extract_text(response) or ""),
    )

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
    app.logger.info(
        "session_chat request session=%s mode=%s channel=%s target=%s message=%s",
        session_id,
        payload.get("mode") or "team",
        payload.get("channel_id") or payload.get("channel") or "team",
        payload.get("target_agent_id") or payload.get("agentId") or payload.get("agent_id") or "",
        _preview(payload.get("message")),
    )

    data = handle_agent_event({
        "session_id": session_id,
        "event_type": "candidate_message",
        "mode": payload.get("mode"),
        "agentId": payload.get("agentId") or payload.get("agent_id"),
        "task_id": payload.get("taskId") or payload.get("task_id"),
        "candidate_message": payload.get("message"),
        "candidate_name": payload.get("candidate_name"),
        "active_file": payload.get("active_file"),
        "current_task": payload.get("currentTask") or payload.get("current_task"),
        "task_context": payload.get("task_context"),
        "workspace_files": payload.get("workspaceFiles") or payload.get("workspace_files"),
        "workspace_snapshot": payload.get("workspace_snapshot"),
        "code": payload.get("code"),
        "channel_id": payload.get("channel_id") or payload.get("channel"),
        "target_agent_id": payload.get("target_agent_id"),
    })

    app.logger.info(
        "session_chat response session=%s phase=%s new_messages=%s primary_agent=%s primary=%s",
        session_id,
        data.get("phase"),
        len(data.get("new_messages") or []),
        (data.get("agent") or {}).get("name") or "",
        _preview(data.get("message")),
    )

    return jsonify(data), 200


@app.route("/api/sessions/<session_id>/tests", methods=["POST"])
def api_session_tests(session_id: str):
    payload = request.get_json(silent=True) or {}
    app.logger.info(
        "session_tests request session=%s mode=%s channel=%s message=%s",
        session_id,
        payload.get("mode") or "team",
        payload.get("channel_id") or payload.get("channel") or "team",
        _preview(payload.get("message")),
    )

    data = handle_agent_event({
        "session_id": session_id,
        "event_type": "run_tests",
        "mode": payload.get("mode"),
        "agentId": payload.get("agentId") or payload.get("agent_id"),
        "task_id": payload.get("taskId") or payload.get("task_id"),
        "candidate_message": payload.get("message") or "I ran the latest checks.",
        "candidate_name": payload.get("candidate_name"),
        "active_file": payload.get("active_file"),
        "current_task": payload.get("currentTask") or payload.get("current_task"),
        "task_context": payload.get("task_context"),
        "workspace_files": payload.get("workspaceFiles") or payload.get("workspace_files"),
        "workspace_snapshot": payload.get("workspace_snapshot"),
        "code": payload.get("code"),
        "test_results": payload.get("test_results") or {},
        "channel_id": payload.get("channel_id") or payload.get("channel"),
        "target_agent_id": payload.get("target_agent_id"),
    })

    app.logger.info(
        "session_tests response session=%s phase=%s new_messages=%s",
        session_id,
        data.get("phase"),
        len(data.get("new_messages") or []),
    )

    return jsonify(data), 200


@app.route("/api/sessions/<session_id>/submit", methods=["POST"])
def api_session_submit(session_id: str):
    payload = request.get_json(silent=True) or {}
    submission = str(payload.get("submission") or payload.get("code") or "")
    app.logger.info(
        "session_submit request session=%s chars=%s reason=%s",
        session_id,
        len(submission),
        payload.get("reason") or "submitted",
    )

    data = handle_agent_event({
        "session_id": session_id,
        "event_type": "submit_solution",
        "mode": payload.get("mode"),
        "task_id": payload.get("taskId") or payload.get("task_id"),
        "candidate_message": submission[:500],
        "candidate_name": payload.get("candidate_name"),
        "active_file": payload.get("active_file"),
        "current_task": payload.get("currentTask") or payload.get("current_task"),
        "task_context": payload.get("task_context"),
        "workspace_files": payload.get("workspaceFiles") or payload.get("workspace_files"),
        "workspace_snapshot": payload.get("workspace_snapshot"),
        "code": submission,
    })

    app.logger.info(
        "session_submit response session=%s report=%s overall=%s",
        session_id,
        bool(data.get("report")),
        (data.get("report") or {}).get("overall_score"),
    )

    return jsonify(data.get("report") or data), 200


@app.route("/api/agent/event", methods=["POST"])
def api_agent_event():
    payload = request.get_json(silent=True) or {}
    app.logger.info(
        "agent_event request session=%s type=%s message=%s",
        payload.get("session_id") or "",
        payload.get("event_type") or "candidate_message",
        _preview(payload.get("candidate_message") or payload.get("message")),
    )
    data = handle_agent_event(payload)
    app.logger.info(
        "agent_event response session=%s phase=%s new_messages=%s primary=%s",
        data.get("session_id") or "",
        data.get("phase"),
        len(data.get("new_messages") or []),
        _preview(data.get("message")),
    )
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


@app.route("/api/sessions/<session_id>/skill-record", methods=["GET"])
def api_get_skill_record(session_id: str):
    skill_record = get_skill_record(session_id)

    if not skill_record:
        return jsonify({"error": "SkillRecord not found."}), 404

    return jsonify(skill_record), 200


@app.route("/api/sessions/<session_id>/skill-record", methods=["POST"])
def api_create_skill_record(session_id: str):
    payload = request.get_json(silent=True) or {}

    data = create_submission({
        "session_id": session_id,
        "submission_text": payload.get("submission") or payload.get("submission_text") or "",
        "user": payload.get("user"),
        "user_id": payload.get("user_id"),
        "user_name": payload.get("user_name"),
        "user_email": payload.get("user_email"),
        "workspace_snapshot": payload.get("workspace_snapshot"),
    })

    return jsonify(data), 200


@app.route("/api/sessions/<session_id>/observer-notes", methods=["GET"])
def api_get_observer_notes(session_id: str):
    notes = get_observer_notes(session_id)
    return jsonify({"notes": notes}), 200


@app.route("/api/sessions/<session_id>/observer-notes", methods=["POST"])
def api_save_observer_note(session_id: str):
    payload = request.get_json(silent=True) or {}

    data = save_observer_note({
        "session_id": session_id,
        "note": payload.get("note"),
        "note_type": payload.get("note_type") or "observation",
        "agent_id": payload.get("agent_id"),
    })

    return jsonify(data), 200


@app.route("/api/ping-llm", methods=["GET"])
def ping_llm():
    if not has_groq_config():
        return jsonify({
            "ok": False,
            "message": "GROQ_API_KEY is missing."
        }), 200

    response = chat_completion(
        messages=[{"role": "user", "content": "Reply with the single word ready."}],
        max_tokens=5,
        temperature=0,
        timeout=8,
    )

    if not response:
        return jsonify({"ok": False, "message": "Groq request failed."}), 200

    return jsonify({
        "ok": True,
        "reply": extract_text(response) or "ready"
    }), 200


if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
