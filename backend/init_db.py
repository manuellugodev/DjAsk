"""
Database initialization script
Run this to create all database tables
"""
from app import app, db, Poll, Response

def init_database():
    with app.app_context():
        print("Creating database tables...")
        db.create_all()
        print("✓ Database tables created successfully!")

        # Print all tables
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        print(f"✓ Tables in database: {tables}")

if __name__ == '__main__':
    init_database()
