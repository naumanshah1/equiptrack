from flask import Blueprint, jsonify, session
from models import MaintenanceRecord
from sqlalchemy import func
from datetime import datetime

analytics_bp = Blueprint("analytics", __name__)

@analytics_bp.route("/analytics/summary", methods=["GET"])
def analytics_summary():

    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    total = MaintenanceRecord.query.count()

    repairs = MaintenanceRecord.query.filter_by(type="Repair").count()
    maintenance = MaintenanceRecord.query.filter_by(type="Maintenance").count()

    # Daily trend
    daily_data = (
        MaintenanceRecord.query
        .with_entities(MaintenanceRecord.date, func.count().label("count"))
        .group_by(MaintenanceRecord.date)
        .order_by(MaintenanceRecord.date)
        .all()
    )

    daily = [
        {"date": str(d[0]), "count": d[1]}
        for d in daily_data
    ]

    # Engineer performance
    engineer_data = (
        MaintenanceRecord.query
        .with_entities(MaintenanceRecord.engineer, func.count().label("count"))
        .group_by(MaintenanceRecord.engineer)
        .all()
    )

    engineers = [
        {"engineer": e[0], "count": e[1]}
        for e in engineer_data
    ]

    return jsonify({
        "total": total,
        "repairs": repairs,
        "maintenance": maintenance,
        "daily": daily,
        "engineers": engineers
    })
