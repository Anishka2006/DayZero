import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")


def supabase_config_missing():
    return not SUPABASE_URL or not SUPABASE_KEY


@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "DayZero auth server running"}), 200


@app.route("/signup", methods=["POST"])
def signup():
    if supabase_config_missing():
        return jsonify({"error": "Supabase env not configured"}), 500

    data = request.get_json() or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role = data.get("role", "user")

    if not name or not email or not password:
        return jsonify({"error": "All fields required"}), 400

    if role not in ["user", "recruiter"]:
        return jsonify({"error": "Invalid role"}), 400

    try:
        res = requests.post(
            f"{SUPABASE_URL}/auth/v1/signup",
            headers={
                "apikey": SUPABASE_KEY,
                "Content-Type": "application/json",
            },
            json={
                "email": email,
                "password": password,
                "data": {
                    "full_name": name,
                    "role": role,
                },
            },
            timeout=5,
        )

        payload = res.json()

        if res.status_code >= 400:
            return jsonify({
                "error": payload.get("msg")
                or payload.get("error_description")
                or payload.get("error")
                or "Signup failed"
            }), res.status_code

        user = payload.get("user") or {}

        return jsonify({
            "message": "Signup successful",
            "user": {
                "id": user.get("id"),
                "name": name,
                "email": email,
                "role": role,
            }
        }), 200

    except requests.exceptions.Timeout:
        return jsonify({"error": "Signup took too long. Try again."}), 504
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/login", methods=["POST"])
def login():
    if supabase_config_missing():
        return jsonify({"error": "Supabase env not configured"}), 500

    data = request.get_json() or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    requested_role = data.get("role")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    try:
        res = requests.post(
            f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
            headers={
                "apikey": SUPABASE_KEY,
                "Content-Type": "application/json",
            },
            json={
                "email": email,
                "password": password,
            },
            timeout=5,
        )

        payload = res.json()

        if res.status_code >= 400:
            return jsonify({
                "error": payload.get("msg")
                or payload.get("error_description")
                or payload.get("error")
                or "Login failed"
            }), res.status_code

        user = payload.get("user") or {}
        metadata = user.get("user_metadata") or {}

        user_role = metadata.get("role", "user")
        user_name = metadata.get("full_name", "User")

        if requested_role and requested_role != user_role:
            return jsonify({
                "error": f"This account is registered as '{user_role}', not '{requested_role}'."
            }), 403

        return jsonify({
            "message": "Login successful",
            "access_token": payload.get("access_token"),
            "user": {
                "id": user.get("id"),
                "name": user_name,
                "email": user.get("email", email),
                "role": user_role,
            }
        }), 200

    except requests.exceptions.Timeout:
        return jsonify({"error": "Login took too long. Try again."}), 504
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/request-demo", methods=["POST"])
def request_demo():
    data = request.get_json() or {}

    name = data.get("name", "").strip()
    phone = data.get("phone", "").strip()

    if not name or not phone:
        return jsonify({"error": "All fields required"}), 400

    return jsonify({"message": "Demo request submitted"}), 200


if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=8001, use_reloader=False)