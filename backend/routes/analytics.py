from flask import Blueprint, jsonify, session
from models import MaintenanceRecord
from sqlalchemy import func
from datetime import datetime

analytics_bp = Blueprint("analytics", __name__)

@analytics_bp.route("/analytics", methods=["GET"])
def get_analytics():

    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    # KPI counts
    total = MaintenanceRecord.query.count()
    repairs = MaintenanceRecord.query.filter_by(type="Repair").count()
    maintenance = MaintenanceRecord.query.filter_by(type="Maintenance").count()

    # Monthly Trend
    monthly_data = (
        MaintenanceRecord.query
        .with_entities(
            func.extract("month", MaintenanceRecord.date).label("month"),
            func.count(MaintenanceRecord.id)
        )
        .group_by("month")
        .all()
    )

    monthly = [
        {
            "month": int(m[0]),
            "count": m[1]
        }
        for m in monthly_data
    ]

    # Engineer Performance
    engineer_data = (
        MaintenanceRecord.query
        .with_entities(
            MaintenanceRecord.engineer,
            func.count(MaintenanceRecord.id)
        )
        .group_by(MaintenanceRecord.engineer)
        .all()
    )

    engineers = [
        {
            "engineer": e[0],
            "count": e[1]
        }
        for e in engineer_data
    ]

    return jsonify({
        "total": total,
        "repairs": repairs,
        "maintenance": maintenance,
        "monthly": monthly,
        "engineers": engineers
    })
