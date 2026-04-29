from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

# =========================
# 🔗 DATABASE CONNECTION
# =========================
db = mysql.connector.connect(
    host="localhost",
    user="root",         
    password="yourpassword",  # 🔴 put your MySQL password
    database="dayzero"   
)

cursor = db.cursor()

# =========================
# 📝 SIGNUP
# =========================
@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    existing_user = cursor.fetchone()

    if existing_user:
        return jsonify({"error": "User already exists"}), 409
    hashed_password = generate_password_hash(password)
    cursor.execute(
        "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
        (name, email, hashed_password)
    )
    db.commit()

    return jsonify({
        "message": "Signup successful 🚀",
        "user": {
            "name": name,
            "email": email
        }
    }), 200


# =========================
# 🔐 LOGIN
# =========================
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()

    if not user:
        return jsonify({"error": "User not found"}), 401

    stored_password = user[3]

    if not check_password_hash(stored_password, password):
        return jsonify({"error": "Invalid password"}), 401

    return jsonify({
        "message": "Login successful 🚀",
        "user": {
            "id": user[0],
            "name": user[1],
            "email": user[2]
        }
    }), 200


@app.route("/request-demo", methods=["POST"])
def request_demo():
    data = request.get_json()

    name = data.get("name")
    phone = data.get("phone")
    if not name or not phone:
        return jsonify({"error": "All fields are required"}), 400

    try:
        cursor.execute(
            "INSERT INTO demo_requests (name, phone) VALUES (%s, %s)",
            (name, phone)
        )
        db.commit()

        return jsonify({
            "message": "Demo request submitted 🚀"
        }), 200

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Failed to submit demo"}), 500


# =========================
# 🏁 RUN SERVER
# =========================
if __name__ == "__main__":
    app.run(debug=True)