from flask import Blueprint, request, jsonify, session
from models import User

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    user = User.query.filter_by(username=data.get("username")).first()

    if not user or not user.check_password(data.get("password")):
        return jsonify({"error": "Invalid username or password"}), 401

    session["user_id"] = user.id
    session["role"] = user.role
    session["username"] = user.username

    return jsonify({
        "success": True,
        "username": user.username,
        "role": user.role
    })


@auth_bp.route("/logout", methods=["GET"])
def logout():
    session.clear()
    return jsonify({"success": True})
