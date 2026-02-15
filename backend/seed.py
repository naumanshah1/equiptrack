from app import app
from models import db, User

with app.app_context():
    # Check if admin already exists
    if not User.query.filter_by(username="admin").first():
        admin = User(
            username="admin",
            role="admin",
            engineer_id=1
        )
        admin.set_password("admin123")
        db.session.add(admin)
        db.session.commit()
        print("✅ Admin user created")
    else:
        print("⚠️ Admin already exists")
