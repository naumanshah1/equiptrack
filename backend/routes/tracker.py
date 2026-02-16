from flask import Blueprint, request, jsonify, session, send_file
from datetime import datetime
from models import db, MaintenanceRecord
import io
import pandas as pd

tracker_bp = Blueprint("tracker", __name__)

PER_PAGE = 10


@tracker_bp.route("/tracker/<mode>", methods=["GET"])
def fetch_records(mode):

    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    page = request.args.get("page", 1, type=int)
    search = request.args.get("search", "")
    from_date = request.args.get("from")
    to_date = request.args.get("to")

    query = MaintenanceRecord.query

    if search:
        query = query.filter(
            MaintenanceRecord.machine_id.ilike(f"%{search}%")
        )

    if from_date and to_date:
        start = datetime.strptime(from_date, "%Y-%m-%d").date()
        end = datetime.strptime(to_date, "%Y-%m-%d").date()
        query = query.filter(MaintenanceRecord.date.between(start, end))

    pagination = query.order_by(MaintenanceRecord.id.desc()) \
                      .paginate(page=page, per_page=PER_PAGE)

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


@tracker_bp.route("/tracker/add", methods=["POST"])
def add_record():

    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()

    record = MaintenanceRecord(
        machine_id=data.get("machine"),
        engineer=session["username"],
        date=datetime.today().date(),
        type=data.get("type", "Repair"),
        remarks=data.get("remarks", "")
    )

    db.session.add(record)
    db.session.commit()

    return jsonify({"success": True})


@tracker_bp.route("/tracker/export", methods=["GET"])
def export_excel():

    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    records = MaintenanceRecord.query.all()

    data = [{
        "Machine": r.machine_id,
        "Engineer": r.engineer,
        "Date": r.date.strftime("%Y-%m-%d"),
        "Type": r.type,
        "Remarks": r.remarks
    } for r in records]

    df = pd.DataFrame(data)

    output = io.BytesIO()
    df.to_excel(output, index=False)
    output.seek(0)

    return send_file(
        output,
        download_name="equiptrack.xlsx",
        as_attachment=True
    )
