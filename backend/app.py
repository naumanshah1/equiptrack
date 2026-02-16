import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from models import db, User
from routes.auth import auth_bp
from routes.tracker import tracker_bp
from routes.analytics import analytics_bp
from werkzeug.security import generate_password_hash

# --------------------------------------------------
# CREATE FLASK APP
# --------------------------------------------------
app = Flask(__name__, static_folder="build", static_url_path="/")

# --------------------------------------------------
# SECRET KEY
# --------------------------------------------------
app.secret_key = os.environ.get("SECRET_KEY", "dev-secret")

# --------------------------------------------------
# DATABASE CONFIGURATION
# --------------------------------------------------
db_url = os.environ.get("DATABASE_URL")

if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

if db_url:
    app.config["SQLALCHEMY_DATABASE_URI"] = db_url
else:
    app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:setback1@localhost/equiptrack"

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# --------------------------------------------------
# SESSION SECURITY
# --------------------------------------------------
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = True

# --------------------------------------------------
# INITIALIZE DATABASE
# --------------------------------------------------
db.init_app(app)

# --------------------------------------------------
# ENABLE CORS
# --------------------------------------------------
CORS(app, supports_credentials=True)

# --------------------------------------------------
# REGISTER BLUEPRINTS
# --------------------------------------------------
app.register_blueprint(auth_bp)
app.register_blueprint(tracker_bp)
app.register_blueprint(analytics_bp)

# --------------------------------------------------
# CREATE TABLES + DEFAULT USERS
# --------------------------------------------------
with app.app_context():
    db.create_all()

    # Create Admin if not exists
    if not User.query.filter_by(username="admin").first():
        admin = User(
            username="admin",
            password=generate_password_hash("admin123"),
            role="admin"
        )
        db.session.add(admin)
        print("Admin user created")

    # Create Engineer if not exists
    if not User.query.filter_by(username="engineer").first():
        engineer = User(
            username="engineer",
            password=generate_password_hash("engineer123"),
            role="engineer"
        )
        db.session.add(engineer)
        print("Engineer user created")

    db.session.commit()

# --------------------------------------------------
# SERVE REACT FRONTEND
# --------------------------------------------------
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")

# --------------------------------------------------
# RUN LOCALLY
# --------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True)
