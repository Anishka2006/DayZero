from __future__ import annotations
from flask import Flask, request, jsonify
import os
import sys
import logging
from pathlib import Path
from flask_cors import CORS
from dotenv import load_dotenv
try:
    from .db import db as mongo_db
    from .db import invited_candidates_collection, users_collection, projects_collection
except ImportError:
    from db import db as mongo_db
    from db import invited_candidates_collection, users_collection, projects_collection
from pymongo import MongoClient
import pymongo
from datetime import datetime
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)

app.logger.setLevel(os.getenv("DAYZERO_LOG_LEVEL", "INFO").upper())

app.config['CORS_HEADERS'] = 'Content-Type'

import re
CORS(app, resources={r"/*": {
    "origins": [
        "https://anishka2006.github.io",
        "https://saavi122.github.io",
        re.compile(r"^https://.*\.github\.io$"),
        re.compile(r"^https://.*\.onrender\.com$"),
        re.compile(r"^https?://localhost(:\d+)?$"),
        re.compile(r"^https?://127\.0\.0\.1(:\d+)?$")
    ],
    "methods": ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"]
}})

@app.before_request
def log_request_info():
    app.logger.info("--- Request Info ---")
    app.logger.info(f"Method: {request.method}")
    app.logger.info(f"Path: {request.path}")
    app.logger.info(f"Origin: {request.headers.get('Origin')}")
    if request.is_json:
        app.logger.info(f"Payload: {request.get_json(silent=True)}")
    app.logger.info("--------------------")

@app.errorhandler(Exception)
def handle_exception(e):
    app.logger.error(f"Global exception caught: {str(e)}", exc_info=True)
    
    # Check if PyMongo Error
    import pymongo
    if isinstance(e, pymongo.errors.PyMongoError):
        return jsonify({
            "success": False,
            "error": f"Database error: {str(e)}"
        }), 500
        
    from werkzeug.exceptions import HTTPException
    if isinstance(e, HTTPException):
        return jsonify({
            "success": False,
            "error": e.description,
            "code": e.code
        }), e.code
        
    return jsonify({
        "success": False,
        "error": f"Unexpected backend error: {str(e)}"
    }), 500

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
import uuid

APPROVED_RECRUITER_DOMAINS = {
    "google.com",
    "microsoft.com",
    "amazon.com",
    "apple.com",
    "meta.com",
    "facebook.com",
    "netflix.com",
    "adobe.com",
    "tesla.com",
    "linkedin.com",
    "uber.com",
    "airbnb.com",
    "spotify.com",
    "slack.com",
    "salesforce.com",
    "ibm.com",
    "oracle.com",
    "cisco.com",
    "intel.com",
    "qualcomm.com",
    "vmware.com",
    "redhat.com",
}


def _email_domain(email: str) -> str:
    parts = str(email or "").split("@", 1)
    return parts[1].lower() if len(parts) == 2 else ""


def _public_user(user: dict) -> dict:
    return {
        "id": str(user.get("_id") or user.get("id") or ""),
        "name": user.get("name") or user.get("full_name") or "User",
        "email": user.get("email"),
        "role": user.get("role") or "user",
        "companyId": user.get("companyId"),
        "companyName": user.get("companyName"),
        "projectId": user.get("projectId"),
        "projectTitle": user.get("projectTitle"),
        "experienceLevel": user.get("experienceLevel"),
        "assignedRole": user.get("assignedRole"),
    }


@app.route("/signup", methods=["POST"])
@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json(silent=True) or {}

    name = str(data.get("name") or "").strip()
    email = str(data.get("email") or "").strip().lower()
    password = str(data.get("password") or "")
    role = str(data.get("role") or "user").strip().lower()

    if not name or not email or not password:
        return jsonify({"success": False, "error": "Name, email, and password are required."}), 400
    if role not in {"user", "candidate", "recruiter", "invited candidate", "demo user"}:
        return jsonify({"success": False, "error": "Invalid role."}), 400
    if role == "candidate":
        role = "user"

    if role == "recruiter" and _email_domain(email) not in APPROVED_RECRUITER_DOMAINS:
        return jsonify({
            "success": False,
            "error": "Recruiter registration requires an approved company email."
        }), 403

    invite_details = {}
    if role in {"user", "invited candidate"}:
        invite = invited_candidates_collection.find_one({"email": email, "status": "active"})
        if invite:
            invite_details = {
                "companyId": invite.get("companyId"),
                "companyName": invite.get("companyName"),
                "projectId": invite.get("projectId"),
                "projectTitle": invite.get("projectTitle"),
                "experienceLevel": invite.get("experienceLevel"),
                "assignedRole": invite.get("role"),
            }
            role = "invited candidate"

    user = {
        "id": str(uuid.uuid4()),
        "name": name,
        "email": email,
        "role": role,
        "password_hash": generate_password_hash(password),
        "updatedAt": datetime.utcnow().isoformat(),
        **invite_details,
    }

    users_collection.update_one(
        {"email": email},
        {
            "$set": user,
            "$setOnInsert": {
                "_id": user["id"],
                "createdAt": datetime.utcnow().isoformat(),
                "score": 0,
                "progress": 0,
            },
        },
        upsert=True,
    )
    saved = users_collection.find_one({"email": email}) or user
    return jsonify({"success": True, "message": "Signup successful", "user": _public_user(saved)}), 200


@app.route("/login", methods=["POST"])
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email") or "").strip().lower()
    password = str(data.get("password") or "")
    requested_role = str(data.get("role") or "").strip().lower()

    if not email or not password:
        return jsonify({"success": False, "error": "Email and password are required."}), 400

    user = users_collection.find_one({"email": email})
    stored_hash = str((user or {}).get("password_hash") or "")
    legacy_password = str((user or {}).get("password") or "")
    password_ok = bool(stored_hash and check_password_hash(stored_hash, password)) or bool(legacy_password and legacy_password == password)
    if not user or not password_ok:
        return jsonify({"success": False, "error": "Invalid email or password."}), 401

    user_role = str(user.get("role") or "user").lower()
    if requested_role and requested_role not in {user_role, "candidate"}:
        return jsonify({"success": False, "error": f"This account is registered as '{user_role}'."}), 403

    invite = invited_candidates_collection.find_one({"email": email, "status": "active"})
    if invite and user_role in {"user", "candidate", "invited candidate"}:
        users_collection.update_one(
            {"email": email},
            {"$set": {
                "role": "invited candidate",
                "companyId": invite.get("companyId"),
                "companyName": invite.get("companyName"),
                "projectId": invite.get("projectId"),
                "projectTitle": invite.get("projectTitle"),
                "experienceLevel": invite.get("experienceLevel"),
                "assignedRole": invite.get("role"),
            }},
        )
        user = users_collection.find_one({"email": email}) or user

    return jsonify({
        "success": True,
        "message": "Login successful",
        "access_token": str(user.get("_id") or user.get("id") or ""),
        "user": _public_user(user),
    }), 200


@app.route("/api/invites", methods=["POST", "OPTIONS"])
@app.route("/api/invite-candidate", methods=["POST", "OPTIONS"])
def create_invite():
    import traceback
    if request.method == "OPTIONS":
        response = jsonify({"success": True})
        origin = request.headers.get("Origin")
        if origin:
            response.headers.add("Access-Control-Allow-Origin", origin)
        else:
            response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")

        return response, 200
    
    try:
        app.logger.info("[INVITE ROUTE DEBUG] --- STARTING CREATE INVITE FLOW ---")
        
        # 1. Log Request Info
        app.logger.info(f"[INVITE ROUTE DEBUG] Request URL: {request.url}")
        app.logger.info(f"[INVITE ROUTE DEBUG] Request Headers: {dict(request.headers)}")
        
        data = request.get_json(silent=True) or {}
        app.logger.info(f"[INVITE ROUTE DEBUG] Request Body/Payload: {data}")
        
        email = (data.get("candidateEmail") or data.get("email") or "").strip().lower()
        name = (data.get("candidateName") or data.get("name") or "").strip()
        college = (data.get("college") or "").strip()
        skills = data.get("skills") or ""
        sim_type = data.get("simulationType") or data.get("simType") or "individual"
        role = data.get("role") or "Frontend Engineer"
        project_id = data.get("projectId")
        project_simulation = data.get("projectSimulation")
        project_title = data.get("projectTitle") or project_simulation or ""
        experience_level = data.get("experienceLevel") or "Intermediate"
        message = data.get("inviteMessage") or data.get("message") or ""
        
        # Recruiter and company info
        company_id = data.get("companyId", "").strip().lower()
        company_name = data.get("companyName", "").strip()
        recruiter_id = data.get("recruiterId", "").strip()
        
        app.logger.info(f"[INVITE ROUTE DEBUG] Parsed fields: Email={email}, Name={name}, ProjectID={project_id}, ProjectTitle={project_title}")
        
        if not email or not name:
            app.logger.error("[INVITE ROUTE DEBUG] Invite validation failed: Candidate Email and Name are required")
            return jsonify({"success": False, "error": "Candidate Email and Name are required"}), 400
            
        # Dynamic project matching and assignment via projects_collection
        assigned_project = None
        
        # 1. Search by project ID in db
        if project_id:
            app.logger.info(f"[INVITE ROUTE DEBUG] Querying projects_collection by ID: {project_id}")
            try:
                assigned_project = projects_collection.find_one({"id": project_id}) or projects_collection.find_one({"_id": project_id})
                app.logger.info(f"[INVITE ROUTE DEBUG] Project find_one by ID result: {assigned_project}")
            except Exception as find_err:
                app.logger.error(f"[INVITE ROUTE DEBUG] Failed to find project by ID: {find_err}")
                raise find_err
            
        # 2. Search by exact project title
        if not assigned_project and project_title:
            app.logger.info(f"[INVITE ROUTE DEBUG] Querying projects_collection by exact Title (case-insensitive): {project_title}")
            try:
                assigned_project = projects_collection.find_one({"title": {"$regex": f"^{re.escape(project_title)}$", "$options": "i"}})
                app.logger.info(f"[INVITE ROUTE DEBUG] Project find_one by exact Title result: {assigned_project}")
            except Exception as find_err:
                app.logger.error(f"[INVITE ROUTE DEBUG] Failed to find project by exact Title: {find_err}")
                raise find_err
            
        # 3. Search by containing project title (substring)
        if not assigned_project and project_title:
            app.logger.info(f"[INVITE ROUTE DEBUG] Querying projects_collection by substring Title (case-insensitive): {project_title}")
            try:
                assigned_project = projects_collection.find_one({"title": {"$regex": re.escape(project_title), "$options": "i"}})
                app.logger.info(f"[INVITE ROUTE DEBUG] Project find_one by substring Title result: {assigned_project}")
            except Exception as find_err:
                app.logger.error(f"[INVITE ROUTE DEBUG] Failed to find project by substring Title: {find_err}")
                raise find_err
            
        # 4. Special fallback: if "Linked Frontend Console" or "Frontend Console", match it
        if not assigned_project and ("Frontend Console" in project_title or "Linked Frontend Console" in project_title):
            app.logger.info(f"[INVITE ROUTE DEBUG] Querying projects_collection by fallback 'Frontend Console'")
            try:
                assigned_project = projects_collection.find_one({"title": {"$regex": "Frontend Console", "$options": "i"}})
                app.logger.info(f"[INVITE ROUTE DEBUG] Project find_one by fallback Title result: {assigned_project}")
            except Exception as find_err:
                app.logger.error(f"[INVITE ROUTE DEBUG] Failed to find project by fallback Title: {find_err}")
                raise find_err
            
        # 5. If STILL not found, let's create this project dynamically in db so that it exists and has a real ID!
        if not assigned_project:
            new_project_id = project_id or str(uuid.uuid4())
            new_project_title = project_title or "Linked Frontend Console"
            assigned_project = {
                "_id": new_project_id,
                "id": new_project_id,
                "title": new_project_title,
                "description": "Develop the primary consumer interaction interface.",
                "techStack": "React, TypeScript, TailwindCSS, Vite",
                "deadline": "2026-10-01",
                "status": "Planning",
                "createdAt": datetime.utcnow().isoformat(),
                "companyId": company_id or "default"
            }
            app.logger.info(f"[INVITE ROUTE DEBUG] Project not found. Seeding new project in projects_collection: {assigned_project}")
            try:
                projects_collection.update_one(
                    {"title": new_project_title},
                    {"$set": assigned_project},
                    upsert=True
                )
                app.logger.info("[INVITE ROUTE DEBUG] Project seeded successfully!")
                # Re-fetch the saved project
                assigned_project = projects_collection.find_one({"title": new_project_title})
                app.logger.info(f"[INVITE ROUTE DEBUG] Re-fetched seeded project: {assigned_project}")
            except Exception as seed_err:
                app.logger.error(f"[INVITE ROUTE DEBUG] Failed to seed project: {seed_err}")
                raise seed_err
            
        # Overwrite values with verified database records
        project_id = assigned_project.get("id") or str(assigned_project.get("_id"))
        project_title = assigned_project.get("title")
        
        app.logger.info(f"[INVITE ROUTE DEBUG] Verified Project Assigned: {project_title} (ID: {project_id})")
            
        token = str(uuid.uuid4())
        invite_id = str(uuid.uuid4())
        
        invite = {
            "_id": invite_id,
            "id": invite_id,
            "email": email,
            "name": name,
            "candidateName": name,
            "candidateEmail": email,
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
            "projectAssigned": project_id,
            "roleAssigned": role,
            "inviteStatus": "active",
            "status": "active",
            "token": token,
            "inviteToken": token,
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat()
        }
        
        # Save to database
        invite_data = invite.copy()
        invite_id_val = invite_data.pop("_id")

        app.logger.info(f"[INVITE ROUTE DEBUG] Saving candidate invite in invited_candidates_collection: email={email}, invite_id={invite_id_val}")
        try:
            update_res = invited_candidates_collection.update_one(
                {"email": email},
                {
                    "$set": invite_data,
                    "$setOnInsert": {"_id": invite_id_val}
                },
                upsert=True
            )
            app.logger.info(f"[INVITE ROUTE DEBUG] update_one result: matched={update_res.matched_count}, modified={update_res.modified_count}, upserted_id={update_res.upserted_id}")
        except Exception as save_err:
            app.logger.error(f"[INVITE ROUTE DEBUG] Failed to save candidate invite: {save_err}")
            raise save_err
        
        app.logger.info(f"[INVITE ROUTE DEBUG] Candidate Saved successfully: {name} ({email})")
        app.logger.info(f"[INVITE ROUTE DEBUG] Invite Sent Successfully to {email}!")
        
        return jsonify({
            "success": True, 
            "message": "✓ Candidate Invited Successfully", 
            "inviteId": invite_id,
            "inviteToken": token,
            "invite": invite
        }), 201
        
    except pymongo.errors.PyMongoError as db_err:
        tb = traceback.format_exc()
        app.logger.error(f"[INVITE ROUTE DEBUG] Database connection failure during invite creation:\n{tb}")
        return jsonify({
            "success": False, 
            "error": f"Database error: {db_err}",
            "traceback": tb
        }), 500
    except Exception as e:
        tb = traceback.format_exc()
        app.logger.error(f"[INVITE ROUTE DEBUG] Unexpected crash during invite creation:\n{tb}")
        return jsonify({
            "success": False, 
            "error": f"Unexpected backend error: {e}",
            "traceback": tb
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

load_dotenv()

logging.basicConfig(
    level=os.getenv("DAYZERO_LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    force=True,
)



# Database collections are imported cleanly from db.py at the top of the file


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
            overall_score = report.get("overall_score", 0)
            skill_scores = report.get("skill_scores", {})
            
            skills = {
                "Leadership": skill_scores.get("role_judgment", 0),
                "Communication": skill_scores.get("communication", 0),
                "Execution": skill_scores.get("technical_reasoning", 0),
                "ProblemSolving": skill_scores.get("problem_solving", 0),
                "Adaptability": skill_scores.get("collaboration", 0)
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


skill_records_collection = mongo_db["skill_records"]
submissions_collection = mongo_db["submissions"]
observer_notes_collection = mongo_db["observer_notes"]


def _mongo_doc(doc: dict | None) -> dict | None:
    if not doc:
        return None
    clean = dict(doc)
    if "_id" in clean:
        clean["_id"] = str(clean["_id"])
    return clean


def get_skill_record(session_id: str) -> dict | None:
    record = skill_records_collection.find_one({"session_id": session_id}, sort=[("createdAt", -1)])
    return _mongo_doc(record)


def create_submission(payload: dict) -> dict:
    now = datetime.utcnow().isoformat()
    session_id = str(payload.get("session_id") or "")
    submission_text = str(payload.get("submission_text") or payload.get("submission") or "")
    record = {
        "session_id": session_id,
        "submission_text": submission_text,
        "workspace_snapshot": payload.get("workspace_snapshot"),
        "user": payload.get("user"),
        "user_id": payload.get("user_id"),
        "user_name": payload.get("user_name"),
        "user_email": payload.get("user_email"),
        "status": "submitted",
        "createdAt": now,
        "updatedAt": now,
    }
    result = submissions_collection.insert_one(record)
    record["_id"] = str(result.inserted_id)
    skill_records_collection.update_one(
        {"session_id": session_id},
        {"$set": {**record, "updatedAt": now}, "$setOnInsert": {"createdAt": now}},
        upsert=True,
    )
    return {"success": True, "submission": record, "skill_record": get_skill_record(session_id)}


def save_observer_note(payload: dict) -> dict:
    now = datetime.utcnow().isoformat()
    note = {
        "session_id": str(payload.get("session_id") or ""),
        "note": str(payload.get("note") or "").strip(),
        "note_type": str(payload.get("note_type") or "observation"),
        "agent_id": payload.get("agent_id"),
        "createdAt": now,
    }
    result = observer_notes_collection.insert_one(note)
    note["_id"] = str(result.inserted_id)
    return {"success": True, "note": note}


def get_observer_notes(session_id: str) -> list[dict]:
    notes = observer_notes_collection.find({"session_id": session_id}).sort("createdAt", 1)
    return [_mongo_doc(note) for note in notes]



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
        agent=incoming.get("agent") or "api-chat",
        route=incoming.get("route") or "live_chat",
    )

    if not response:
        app.logger.warning(
            "api_chat provider=%s status=failed model=%s messages=%s",
            configured_provider() or "none",
            incoming.get("model") or "default",
            len(messages),
        )
        return jsonify({
            "choices": [{
                "message": {
                    "role": "assistant",
                    "content": "I am here. Keep the next DayZero move concrete: decision, tradeoff, and proof."
                }
            }],
            "_dayzero_provider": "demo-safe",
            "_dayzero_model": "role-fallback",
        }), 200

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
            "message": "Live AI check is not ready yet; demo safety replies are enabled."
        }), 200

    response = chat_completion(
        messages=[{"role": "user", "content": "Reply with the single word ready."}],
        max_tokens=5,
        temperature=0,
        timeout=8,
    )

    if not response:
        return jsonify({"ok": False, "message": "Live AI check is warming up; demo safety replies are enabled."}), 200

    return jsonify({
        "ok": True,
        "reply": extract_text(response) or "ready",
        "provider": response.get("_dayzero_provider") or configured_provider(),
        "model": response.get("_dayzero_model") or default_model_for(configured_provider()),
    }), 200


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    
    # Verify MongoDB Connection on startup
    try:
        from db import get_client
        client = get_client()
        # Ping the admin database to verify connection
        client.admin.command('ping')
        print("Connected to MongoDB")
        app.logger.info("Connected to MongoDB successfully.")
    except Exception as db_err:
        print(f"Failed to connect to MongoDB: {db_err}")
        app.logger.error(f"Failed to connect to MongoDB: {db_err}")
        
    print(f"Server running on PORT {port}")
    app.logger.info(f"Server running on PORT {port}")
    
    print("Invite routes registered")
    app.logger.info("Invite routes registered: POST /api/invites, POST /api/invite-candidate")
    
    app.run(debug=False, host="0.0.0.0", port=port)
