from flask import Blueprint, send_file, session, jsonify
from models import MaintenanceRecord
import io
from openpyxl import Workbook
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

reports_bp = Blueprint("reports", __name__, url_prefix="/reports")

def admin_required():
    return session.get("role") == "admin"


@reports_bp.route("/excel")
def excel_report():
    if not admin_required():
        return jsonify({"error": "Admin only"}), 403

    wb = Workbook()
    ws = wb.active
    ws.append(["ID", "Machine", "Engineer", "Date", "Type", "Remarks"])

    records = MaintenanceRecord.query.all()
    for r in records:
        ws.append([
            r.record_id,
            r.machine_id,
            r.engineer_id,
            r.date.isoformat(),
            r.type,
            r.remarks
        ])

    file = io.BytesIO()
    wb.save(file)
    file.seek(0)

    return send_file(
        file,
        as_attachment=True,
        download_name="maintenance_report.xlsx",
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


@reports_bp.route("/pdf")
def pdf_report():
    if not admin_required():
        return jsonify({"error": "Admin only"}), 403

    file = io.BytesIO()
    pdf = canvas.Canvas(file, pagesize=A4)
    pdf.setFont("Helvetica", 10)

    y = 800
    pdf.drawString(50, y, "Maintenance Report")
    y -= 30

    records = MaintenanceRecord.query.all()
    for r in records:
        pdf.drawString(
            50, y,
            f"{r.record_id} | {r.machine_id} | {r.engineer_id} | {r.date} | {r.type} | {r.remarks}"
        )
        y -= 15
        if y < 50:
            pdf.showPage()
            y = 800

    pdf.save()
    file.seek(0)

    return send_file(
        file,
        as_attachment=True,
        download_name="maintenance_report.pdf",
        mimetype="application/pdf"
    )
