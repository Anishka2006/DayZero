from __future__ import annotations

import os
import re
import uuid
from datetime import datetime

import pymongo
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash

try:
    from .db import invited_candidates_collection, users_collection
except ImportError:
    from db import invited_candidates_collection, users_collection

load_dotenv()

app = Flask(__name__)
app.logger.setLevel(os.getenv("DAYZERO_LOG_LEVEL", "INFO").upper())

CORS(app, resources={r"/*": {
    "origins": [
        "https://anishka2006.github.io",
        "https://saavi122.github.io",
        re.compile(r"^https://.*\.github\.io$"),
        re.compile(r"^https://.*\.onrender\.com$"),
        re.compile(r"^https?://localhost(:\d+)?$"),
        re.compile(r"^https?://127\.0\.0\.1(:\d+)?$"),
    ],
    "methods": ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
}})


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


@app.before_request
def log_request_info():
    app.logger.info(
        "auth_request method=%s path=%s origin=%s",
        request.method,
        request.path,
        request.headers.get("Origin"),
    )


@app.errorhandler(Exception)
def handle_exception(exc):
    app.logger.error("Global auth exception caught: %s", exc, exc_info=True)
    from werkzeug.exceptions import HTTPException

    if isinstance(exc, pymongo.errors.PyMongoError):
        return jsonify({"success": False, "error": "Could not complete that request. Please try again."}), 500
    if isinstance(exc, HTTPException):
        return jsonify({"success": False, "error": exc.description, "code": exc.code}), exc.code
    return jsonify({"success": False, "error": "Something went wrong. Please try again."}), 500


def get_email_domain(email: str) -> str:
    parts = str(email or "").split("@", 1)
    return parts[1].lower() if len(parts) == 2 else ""


def is_approved_recruiter_domain(email: str) -> bool:
    return get_email_domain(email) in APPROVED_RECRUITER_DOMAINS


def public_user(user: dict) -> dict:
    return {
        "id": str(user.get("_id") or user.get("id") or ""),
        "name": user.get("name") or "User",
        "email": user.get("email"),
        "role": user.get("role") or "user",
        "companyId": user.get("companyId"),
        "companyName": user.get("companyName"),
        "projectId": user.get("projectId"),
        "projectTitle": user.get("projectTitle"),
        "experienceLevel": user.get("experienceLevel"),
        "assignedRole": user.get("assignedRole"),
    }


def invite_details_for(email: str) -> dict:
    invite = invited_candidates_collection.find_one({"email": email, "status": "active"})
    if not invite:
        return {}
    return {
        "companyId": invite.get("companyId"),
        "companyName": invite.get("companyName"),
        "projectId": invite.get("projectId"),
        "projectTitle": invite.get("projectTitle"),
        "experienceLevel": invite.get("experienceLevel"),
        "assignedRole": invite.get("role"),
    }


@app.route("/", methods=["GET"])
def home():
    return jsonify({"ok": True, "message": "DayZero auth server running"}), 200


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
    if role == "candidate":
        role = "user"
    if role not in {"user", "invited candidate", "recruiter", "demo user"}:
        return jsonify({"success": False, "error": "Invalid role."}), 400
    if role == "recruiter" and not is_approved_recruiter_domain(email):
        return jsonify({
            "success": False,
            "error": "Recruiter registration requires an approved company email.",
        }), 403

    invite_details = invite_details_for(email) if role in {"user", "invited candidate"} else {}
    if invite_details:
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
    return jsonify({"success": True, "message": "Signup successful", "user": public_user(saved)}), 200


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

    invite_details = invite_details_for(email)
    if invite_details and user_role in {"user", "candidate", "invited candidate"}:
        users_collection.update_one(
            {"email": email},
            {"$set": {"role": "invited candidate", **invite_details, "updatedAt": datetime.utcnow().isoformat()}},
        )
        user = users_collection.find_one({"email": email}) or user

    return jsonify({
        "success": True,
        "message": "Login successful",
        "access_token": str(user.get("_id") or user.get("id") or ""),
        "user": public_user(user),
    }), 200


@app.route("/request-demo", methods=["POST"])
def request_demo():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name") or "").strip()
    phone = str(data.get("phone") or "").strip()

    if not name or not phone:
        return jsonify({"success": False, "error": "All fields required"}), 400

    return jsonify({"success": True, "message": "Demo request submitted"}), 200


@app.route("/approved-recruiter-domains", methods=["GET"])
def get_approved_domains():
    return jsonify({"domains": sorted(APPROVED_RECRUITER_DOMAINS)}), 200


if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=int(os.getenv("AUTH_PORT", 8001)), use_reloader=False)
