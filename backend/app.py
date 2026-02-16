import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from models import db
from routes.auth import auth_bp
from routes.tracker import tracker_bp
from routes.analytics import analytics_bp

# --------------------------------------------------
# CREATE FLASK APP
# --------------------------------------------------
# static_folder="build" → React production files
# static_url_path="/" → Serve React at root URL
app = Flask(__name__, static_folder="build", static_url_path="/")

# --------------------------------------------------
# SECRET KEY (Security for sessions)
# Uses environment variable in production
# Falls back to local default for development
# --------------------------------------------------
app.secret_key = os.environ.get("SECRET_KEY", "dev-secret")

# --------------------------------------------------
# DATABASE CONFIGURATION
# --------------------------------------------------
# Get database URL from environment (Render)
db_url = os.environ.get("DATABASE_URL")

# Fix for older postgres:// format (Render compatibility)
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Use Render database if available
# Otherwise use local PostgreSQL
if db_url:
    app.config["SQLALCHEMY_DATABASE_URI"] = db_url
else:
    app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:setback1@localhost/equiptrack"

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# --------------------------------------------------
# SESSION SECURITY (Production Safe)
# --------------------------------------------------
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = True

# --------------------------------------------------
# INITIALIZE DATABASE
# --------------------------------------------------
db.init_app(app)

# --------------------------------------------------
# ENABLE CORS (Frontend ↔ Backend communication)
# --------------------------------------------------
CORS(app, supports_credentials=True)

# --------------------------------------------------
# REGISTER BLUEPRINTS (Modular Routes)
# --------------------------------------------------
app.register_blueprint(auth_bp)
app.register_blueprint(tracker_bp)
app.register_blueprint(analytics_bp)

# --------------------------------------------------
# AUTO CREATE TABLES (Student Project Setup)
# In real production → use Flask-Migrate
# --------------------------------------------------
with app.app_context():
    db.create_all()

# --------------------------------------------------
# SERVE REACT FRONTEND (Single Page App Support)
# --------------------------------------------------
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    # If file exists in build folder → serve it
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    
    # Otherwise return React index.html
    return send_from_directory(app.static_folder, "index.html")

# --------------------------------------------------
# RUN LOCALLY (Development Mode Only)
# Production uses Gunicorn
# --------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True)
