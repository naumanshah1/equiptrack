from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


# =========================
# USER MODEL (AUTH)
# =========================
class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # admin / engineer

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


# =========================
# MAINTENANCE RECORDS
# =========================
class MaintenanceRecord(db.Model):
    __tablename__ = "maintenance_records"

    id = db.Column(db.Integer, primary_key=True)
    machine_id = db.Column(db.String(50), nullable=False)
    engineer = db.Column(db.String(100), nullable=False)
    date = db.Column(db.Date, nullable=False)
    type = db.Column(db.String(50), nullable=False)
    remarks = db.Column(db.Text, nullable=True)
