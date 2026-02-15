from app import app
from models import db, User

with app.app_context():
    # Delete old users (dev only)
    User.query.delete()

    admin = User(username="admin", role="admin")
    admin.set_password("admin123")

    engineer = User(username="engineer1", role="engineer")
    engineer.set_password("engineer123")

    db.session.add(admin)
    db.session.add(engineer)
    db.session.commit()

    print("✅ Users created successfully")
