from flask import Flask
from flask_cors import CORS
from models import db
from routes.auth import auth_bp
from routes.tracker import tracker_bp
from routes.analytics import analytics_bp

app = Flask(__name__)

# ===== SECRET KEY =====
app.secret_key = "equiptrack-secret"

# ===== DATABASE CONFIG =====
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:setback1@localhost/equiptrack"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# ===== SESSION CONFIG =====
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SECURE"] = False

db.init_app(app)

# ===== CORS CONFIG =====
CORS(
    app,
    supports_credentials=True,
    origins=["http://localhost:3000"]
)

# ===== REGISTER BLUEPRINTS =====
app.register_blueprint(auth_bp)
app.register_blueprint(tracker_bp)
app.register_blueprint(analytics_bp)

# ===== CREATE TABLES =====
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)
