from flask import Blueprint

from routes.auth import auth_bp
from routes.records import records_bp
from routes.reports import reports_bp

api = Blueprint("api", __name__)

api.register_blueprint(auth_bp)
api.register_blueprint(records_bp)
api.register_blueprint(reports_bp)
