import os
from flask import Flask
from flask_cors import CORS
from models import db
from routes.auth import auth_bp
from routes.tracker import tracker_bp
from routes.analytics import analytics_bp

app = Flask(__name__)

app.secret_key = os.environ.get("SECRET_KEY", "equiptrack-secret")

app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# 🔥 Required for sessions cross-domain
app.config["SESSION_COOKIE_SAMESITE"] = "None"
app.config["SESSION_COOKIE_SECURE"] = True

db.init_app(app)

CORS(app, supports_credentials=True)

app.register_blueprint(auth_bp)
app.register_blueprint(tracker_bp)
app.register_blueprint(analytics_bp)

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run()
