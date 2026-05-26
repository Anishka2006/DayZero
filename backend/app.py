from __future__ import annotations
from flask import Flask, request, jsonify
import os
import sys
import logging
from pathlib import Path
from flask_cors import CORS
from dotenv import load_dotenv
from db import users_collection
from pymongo import MongoClient
import pymongo
from datetime import datetime

app = Flask(__name__)

app.logger.setLevel(os.getenv("DAYZERO_LOG_LEVEL", "INFO").upper())
CORS(app)


@app.route("/api/user-profile", methods=["GET"])
def get_user_profile():

    email = request.args.get("email")

    user = users_collection.find_one({
        "email": email
    })

    if not user:
        return jsonify({
            "success": False,
            "message": "User not found"
        }), 404

    user.pop("password_hash", None)

    user["_id"] = str(user["_id"])

    return jsonify(user)
from flask import request, jsonify
import uuid


@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json()

    user = {
        "_id": str(uuid.uuid4()),
        "name": data["name"],
        "email": data["email"],
        "password": data["password"]
    }

    # TODO: insert into MongoDB here
    return jsonify({"message": "User created", "user": user})


@app.route("/api/invites", methods=["POST"])
def create_invite():
    try:
        data = request.get_json() or {}
        
        email = data.get("email", "").strip().lower()
        name = data.get("name", "").strip()
        college = data.get("college", "").strip()
        skills = data.get("skills", "")
        sim_type = data.get("simType", "individual")
        role = data.get("role", "Frontend Engineer")
        project_id = data.get("projectId")
        project_title = data.get("projectTitle", "")
        experience_level = data.get("experienceLevel", "Intermediate")
        message = data.get("message", "")
        
        # Recruiter and company info
        company_id = data.get("companyId", "").strip().lower()
        company_name = data.get("companyName", "").strip()
        recruiter_id = data.get("recruiterId", "").strip()
        
        if not email or not name:
            return jsonify({"success": False, "error": "Candidate Email and Name are required"}), 400
            
        token = str(uuid.uuid4())
        invite_id = str(uuid.uuid4())
        
        invite = {
            "_id": invite_id,
            "id": invite_id, # Step 3 requirement
            "email": email,
            "name": name,
            "candidateName": name, # Step 3 requirement
            "candidateEmail": email, # Step 3 requirement
            "college": college,
            "skills": skills,
            "simType": sim_type,
            "role": role,
            "projectId": project_id,
            "projectTitle": project_title,
            "experienceLevel": experience_level,
            "message": message,
            "companyId": company_id,
            "companyName": company_name,
            "recruiterId": recruiter_id,
            "projectAssigned": project_id, # Step 3 requirement
            "roleAssigned": role, # Step 3 requirement
            "inviteStatus": "active", # Step 3 requirement
            "status": "active",
            "token": token,
            "inviteToken": token, # Step 3 requirement
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat() # Step 3 requirement
        }
        
        # Force database ping to verify connection before executing write operation
        mongo_client.admin.command('ping')
        
        # Insert or update
        invited_candidates_collection.update_one(
            {"email": email},
            {"$set": invite},
            upsert=True
        )
        
        return jsonify({
            "success": True, 
            "message": "Invite created successfully", 
            "inviteId": invite_id,
            "inviteToken": token,
            "invite": invite
        }), 201
        
    except pymongo.errors.PyMongoError as db_err:
        app.logger.error(f"Database connection failure during invite creation: {db_err}")
        return jsonify({
            "success": False, 
            "error": "Database connection failed. Please ensure MongoDB is running."
        }), 500
    except Exception as e:
        app.logger.error(f"Unexpected crash during invite creation: {e}")
        return jsonify({
            "success": False, 
            "error": f"Internal server error: {str(e)}"
        }), 500


@app.route("/api/invites", methods=["GET"])
def get_invites():
    company_id = request.args.get("companyId", "").strip().lower()
    recruiter_id = request.args.get("recruiterId", "").strip()
    
    query = {}
    if company_id:
        query["companyId"] = company_id
    if recruiter_id:
        query["recruiterId"] = recruiter_id
        
    invites = list(invited_candidates_collection.find(query))
    for inv in invites:
        inv["_id"] = str(inv["_id"])
        
    return jsonify({"success": True, "invites": invites}), 200


@app.route("/api/invites/validate", methods=["GET"])
def validate_invite():
    email = request.args.get("email", "").strip().lower()
    if not email:
        return jsonify({"success": False, "error": "Email is required"}), 400
        
    invite = invited_candidates_collection.find_one({"email": email, "status": "active"})
    if not invite:
        return jsonify({"success": True, "invited": False}), 200
        
    invite["_id"] = str(invite["_id"])
    return jsonify({"success": True, "invited": True, "invite": invite}), 200



PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ai_engine.core.llm import (
    chat_completion,
    configured_provider,
    default_model_for,
    extract_text,
    has_llm_config,
)
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



MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
mongo_client = MongoClient(MONGO_URI)
mongo_db = mongo_client["dayzero"]
users_collection = mongo_db["users"]
invited_candidates_collection = mongo_db["invited_candidates"]


def update_candidate_mongodb_score(email_or_name: str | None, report: dict, submission_text: str):
    try:
        query = {}
        if email_or_name:
            query = {"$or": [{"email": email_or_name.lower().strip()}, {"name": email_or_name}]}
        
        user = None
        if query:
            user = users_collection.find_one(query)
            
        if not user:
            user = users_collection.find_one(sort=[("joinedMs", -1)])
            
        if user:
            overall_score = report.get("overall_score", 50)
            skill_scores = report.get("skill_scores", {})
            
            skills = {
                "Leadership": skill_scores.get("role_judgment", 50),
                "Communication": skill_scores.get("communication", 50),
                "Execution": skill_scores.get("technical_reasoning", 50),
                "ProblemSolving": skill_scores.get("problem_solving", 50),
                "Adaptability": skill_scores.get("collaboration", 50)
            }
            
            top_skill = max(skills.items(), key=lambda x: x[1])[0]
            
            status = "On Track"
            if overall_score >= 85:
                status = "Shortlisted"
            elif overall_score < 65:
                status = "At Risk"
                
            users_collection.update_one(
                {"_id": user["_id"]},
                {"$set": {
                    "score": overall_score,
                    "progress": 100,
                    "topSkill": top_skill,
                    "status": status,
                    "skills": skills,
                    "submission": submission_text
                }, "$push": {
                    "sessions": {
                        "report": report,
                        "submittedAt": datetime.utcnow().isoformat()
                    }
                }}
            )
            app.logger.info(f"Updated candidate scores in MongoDB for: {user.get('email')}")
        else:
            app.logger.warning("No candidate found in MongoDB to update scores.")
    except Exception as e:
        app.logger.error(f"Failed to update candidate scores in MongoDB: {str(e)}")



DEFAULT_FAST_MAX_TOKENS = 160


def _preview(value: object, limit: int = 140) -> str:
    text = str(value or "").replace("\n", " ").strip()
    return text[:limit] + ("..." if len(text) > limit else "")


@app.route("/", methods=["GET"])
def home():
    return jsonify({"ok": True, "message": "DayZero backend running"}), 200


@app.route("/health", methods=["GET"])
def health():
    provider = configured_provider()
    return jsonify({
        "ok": True,
        "llm_configured": has_llm_config(),
        "llm_provider": provider,
        "llm_model": default_model_for(provider) if provider else None,
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
            "api_chat provider=%s status=failed model=%s messages=%s",
            configured_provider() or "none",
            incoming.get("model") or "default",
            len(messages),
        )
        return jsonify({"error": "LLM request failed or API key missing."}), 503

    app.logger.info(
        "api_chat provider=%s status=ok model=%s messages=%s reply_chars=%s",
        response.get("_dayzero_provider") or configured_provider() or "unknown",
        response.get("_dayzero_model") or response.get("model") or incoming.get("model") or "default",
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

    report = data.get("report") or data
    email_or_name = payload.get("user_email") or payload.get("candidate_name") or ""
    update_candidate_mongodb_score(email_or_name, report, submission)

    app.logger.info(
        "session_submit response session=%s report=%s overall=%s",
        session_id,
        bool(data.get("report")),
        (data.get("report") or {}).get("overall_score"),
    )

    return jsonify(report), 200



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

'''
users_collection.update_one(
    {"email": user_email},
    {
        "$set": {
            "score": final_score,
            "progress": 100,
            "status": "shortlisted" if final_score >= 85 else "on-track",
            "topSkill": top_skill,
            "skills": skill_breakdown
        },

        "$push": {
            "sessions": session_data
        }
    }
)
''' 

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
    if not has_llm_config():
        return jsonify({
            "ok": False,
            "message": "No LLM provider is configured."
        }), 200

    response = chat_completion(
        messages=[{"role": "user", "content": "Reply with the single word ready."}],
        max_tokens=5,
        temperature=0,
        timeout=8,
    )

    if not response:
        return jsonify({"ok": False, "message": "LLM request failed."}), 200

    return jsonify({
        "ok": True,
        "reply": extract_text(response) or "ready",
        "provider": response.get("_dayzero_provider") or configured_provider(),
        "model": response.get("_dayzero_model") or default_model_for(configured_provider()),
    }), 200


if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=int(os.getenv("PORT", 5001)))
