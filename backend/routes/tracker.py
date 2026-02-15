from flask import Blueprint, request, jsonify, session
from datetime import datetime, timedelta
from models import db, MaintenanceRecord

tracker_bp = Blueprint("tracker", __name__)

PER_PAGE = 10


# ================= FETCH RECORDS =================
@tracker_bp.route("/tracker/<mode>", methods=["GET"])
def fetch_records(mode):

    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    page = request.args.get("page", 1, type=int)
    search = request.args.get("search", "")
    from_date = request.args.get("from")
    to_date = request.args.get("to")

    query = MaintenanceRecord.query

    # 🔥 Custom date override (for weekly/monthly)
    if from_date and to_date:
        start = datetime.strptime(from_date, "%Y-%m-%d").date()
        end = datetime.strptime(to_date, "%Y-%m-%d").date()
        query = query.filter(MaintenanceRecord.date.between(start, end))

    else:
        today = datetime.today().date()

        if mode == "daily":
            query = query.filter_by(date=today)

        elif mode == "weekly":
            start = today - timedelta(days=today.weekday())
            end = start + timedelta(days=6)
            query = query.filter(MaintenanceRecord.date.between(start, end))

        elif mode == "monthly":
            query = query.filter(
                MaintenanceRecord.date.month == today.month,
                MaintenanceRecord.date.year == today.year
            )

    # Role filter
    if session["role"] != "admin":
        query = query.filter_by(engineer=session["username"])

    # Search filter
    if search:
        query = query.filter(
            MaintenanceRecord.machine_id.ilike(f"%{search}%")
        )

    pagination = query.paginate(page=page, per_page=PER_PAGE)

    return jsonify({
        "records": [
            {
                "id": r.id,
                "machine": r.machine_id,
                "engineer": r.engineer,
                "date": r.date.strftime("%Y-%m-%d"),
                "type": r.type,
                "remarks": r.remarks
            }
            for r in pagination.items
        ],
        "total_pages": pagination.pages,
        "current_page": page
    })


# ================= ADD RECORD =================
@tracker_bp.route("/tracker/add", methods=["POST"])
def add_record():

    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()

    engineer_name = (
        session["username"]
        if session["role"] == "engineer"
        else data.get("engineer")
    )

    record = MaintenanceRecord(
        machine_id=data.get("machine"),
        engineer=engineer_name,
        date=datetime.today().date(),
        type=data.get("type"),
        remarks=data.get("remarks")
    )

    db.session.add(record)
    db.session.commit()

    return jsonify({"success": True})


# ================= DELETE =================
@tracker_bp.route("/tracker/delete/<int:record_id>", methods=["DELETE"])
def delete_record(record_id):

    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    if session["role"] != "admin":
        return jsonify({"error": "Forbidden"}), 403

    record = MaintenanceRecord.query.get(record_id)

    if not record:
        return jsonify({"error": "Not found"}), 404

    db.session.delete(record)
    db.session.commit()

    return jsonify({"success": True})
