from app import app
from models import db, User

with app.app_context():
    User.query.delete()

    admin = User(
        username="admin",
        role="admin"
    )
    admin.set_password("admin123")

    db.session.add(admin)
    db.session.commit()

    print("✅ Admin user created")
