import os
import psycopg2
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

app = Flask(__name__)
CORS(app)


def get_db_connection():
    db_host = os.getenv("DB_HOST")
    db_port = os.getenv("DB_PORT")
    db_name = os.getenv("DB_NAME")
    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD")

    if not all([db_host, db_port, db_name, db_user, db_password]):
        return None

    return psycopg2.connect(
        host=db_host,
        port=db_port,
        database=db_name,
        user=db_user,
        password=db_password,
    )


def get_supabase_auth_config():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    return url, key


def has_legacy_users_table():
    conn = get_db_connection()
    if not conn:
        return False

    cursor = conn.cursor()
    try:
        cursor.execute("select to_regclass('public.users')")
        return cursor.fetchone()[0] is not None
    except Exception:
        return False
    finally:
        cursor.close()
        conn.close()


def create_profile_if_missing(user_id, full_name, email, role):
    conn = get_db_connection()
    if not conn:
        raise RuntimeError("Database is not configured.")

    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            insert into profiles (id, full_name, email, role)
            values (%s, %s, %s, %s)
            on conflict (id) do update
            set full_name = excluded.full_name,
                email = excluded.email,
                role = excluded.role
            """,
            (user_id, full_name, email, role),
        )
        conn.commit()
        return True
    finally:
        cursor.close()
        conn.close()


def fetch_profile_by_email(email):
    conn = get_db_connection()
    if not conn:
        return None

    cursor = conn.cursor()
    try:
        cursor.execute(
            "select id, full_name, email, role from profiles where email = %s",
            (email,),
        )
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json() or {}

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "user")

    if not name or not email or not password:
        return jsonify({"error": "All fields required"}), 400

    if role not in ("user", "recruiter"):
        return jsonify({"error": "Invalid role"}), 400

    supabase_url, supabase_key = get_supabase_auth_config()
    if supabase_url and supabase_key:
        try:
            response = requests.post(
                f"{supabase_url}/auth/v1/signup",
                headers={
                    "apikey": supabase_key,
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
                timeout=15,
            )

            payload = response.json()
            if response.status_code >= 400:
                return jsonify({
                    "error": payload.get("msg")
                    or payload.get("error_description")
                    or payload.get("error")
                    or "Signup failed"
                }), response.status_code

            user = payload.get("user") or {}
            user_id = user.get("id")
            user_email = user.get("email", email)
            user_name = user.get("user_metadata", {}).get("full_name") or name
            user_role = user.get("user_metadata", {}).get("role") or role

            if user_id:
                create_profile_if_missing(user_id, user_name, user_email, user_role)
            else:
                return jsonify({
                    "error": "Signup succeeded in auth but no user id was returned, so profile creation could not complete."
                }), 500

            return jsonify({
                "message": "Signup successful",
                "user": {
                    "id": user_id,
                    "name": user_name,
                    "email": user_email,
                    "role": user_role,
                }
            }), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    if not has_legacy_users_table():
        return jsonify({
            "error": "Auth is not fully configured. Add SUPABASE_URL and SUPABASE_ANON_KEY for the current schema, or restore the old users table."
        }), 500

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database is not configured."}), 500

    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
        existing_user = cursor.fetchone()

        if existing_user:
            return jsonify({"error": "User already exists"}), 409

        hashed_password = generate_password_hash(password)
        cursor.execute(
            "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
            (name, email, hashed_password)
        )
        conn.commit()

        return jsonify({
            "message": "Signup successful",
            "user": {
                "name": name,
                "email": email
            }
        }), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    email = data.get("email")
    password = data.get("password")
    requested_role = data.get("role")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    supabase_url, supabase_key = get_supabase_auth_config()
    if supabase_url and supabase_key:
        try:
            response = requests.post(
                f"{supabase_url}/auth/v1/token?grant_type=password",
                headers={
                    "apikey": supabase_key,
                    "Content-Type": "application/json",
                },
                json={
                    "email": email,
                    "password": password,
                },
                timeout=15,
            )

            payload = response.json()
            if response.status_code >= 400:
                return jsonify({
                    "error": payload.get("msg")
                    or payload.get("error_description")
                    or payload.get("error")
                    or "Login failed"
                }), response.status_code

            auth_user = payload.get("user") or {}
            profile = fetch_profile_by_email(email)
            user_id = auth_user.get("id")

            if not profile:
                return jsonify({
                    "error": "Profile not found for this account. Please contact support or sign up again."
                }), 403

            user_id_db, user_name_db, user_email_db, user_role_db = profile
            user_name = user_name_db or auth_user.get("user_metadata", {}).get("full_name")
            user_role = user_role_db
            email = user_email_db
            user_id = user_id_db or user_id

            if requested_role and requested_role != user_role:
                return jsonify({
                    "error": f"This account is registered as '{user_role}', not '{requested_role}'."
                }), 403

            return jsonify({
                "message": "Login successful",
                "user": {
                    "id": str(user_id) if user_id else None,
                    "name": user_name,
                    "email": email,
                    "role": user_role,
                }
            }), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    if not has_legacy_users_table():
        return jsonify({
            "error": "Auth is not fully configured. Add SUPABASE_URL and SUPABASE_ANON_KEY for the current schema, or restore the old users table."
        }), 500

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database is not configured."}), 500

    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"error": "User not found"}), 401

        stored_password = user[3]
        if not check_password_hash(stored_password, password):
            return jsonify({"error": "Invalid password"}), 401

        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user[0],
                "name": user[1],
                "email": user[2]
            }
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@app.route("/request-demo", methods=["POST"])
def request_demo():
    data = request.get_json() or {}

    name = data.get("name")
    phone = data.get("phone")

    if not name or not phone:
        return jsonify({"error": "All fields required"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database is not configured."}), 500

    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO demo_requests (name, phone) VALUES (%s, %s)",
            (name, phone)
        )
        conn.commit()
        return jsonify({"message": "Demo request submitted"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    app.run(debug=False, host="127.0.0.1", port=8001, use_reloader=False)
