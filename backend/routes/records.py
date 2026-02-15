from flask import Blueprint, request, session, jsonify
from models import db, MaintenanceRecord

records_bp = Blueprint("records", __name__)

def admin_required():
    return session.get("role") == "admin"

def engineer_required():
    return session.get("role") in ["engineer", "admin"]


@records_bp.route("/record/add", methods=["POST"])
def add_record():
    if not engineer_required():
        return jsonify({"error": "Access denied"}), 403

    data = request.json

    record = MaintenanceRecord(
        machine_id=data["machine_id"],
        engineer_id=session.get("engineer_id"),
        date=data.get("date"),
        type=data["type"],
        remarks=data["remarks"]
    )

    db.session.add(record)
    db.session.commit()
    return jsonify({"success": True})


@records_bp.route("/record/edit/<int:record_id>", methods=["PUT"])
def edit_record(record_id):
    if not admin_required():
        return jsonify({"error": "Admin only"}), 403

    record = MaintenanceRecord.query.get(record_id)
    if not record:
        return jsonify({"error": "Not found"}), 404

    data = request.json
    record.type = data["type"]
    record.remarks = data["remarks"]

    db.session.commit()
    return jsonify({"success": True})
