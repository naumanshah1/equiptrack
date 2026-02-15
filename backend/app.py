import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from models import db
from routes.auth import auth_bp
from routes.tracker import tracker_bp
from routes.analytics import analytics_bp

app = Flask(__name__, static_folder="build", static_url_path="/")

# SECRET
app.secret_key = os.environ.get("SECRET_KEY", "equiptrack-secret")

# DATABASE
db_url = os.environ.get("DATABASE_URL")

if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

app.config["SQLALCHEMY_DATABASE_URI"] = db_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# SESSION (no cross-domain needed now)
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = True

db.init_app(app)

CORS(app, supports_credentials=True)

app.register_blueprint(auth_bp)
app.register_blueprint(tracker_bp)
app.register_blueprint(analytics_bp)

with app.app_context():
    db.create_all()

# 🔥 Serve React Frontend
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path != "" and os.path.exists(app.static_folder + "/" + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    app.run()
