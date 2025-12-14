#!/usr/bin/env python3
"""
CLI script to create the first admin user
Usage: python create_admin.py
"""

import sys
from app import app, db
from models.admin import Admin
import getpass


def create_admin():
    """Interactive admin creation"""
    print("=" * 50)
    print("djask Admin User Creation")
    print("=" * 50)

    with app.app_context():
        # Check if admin already exists
        existing_admin = Admin.query.first()
        if existing_admin:
            print(f"\n⚠ Warning: Admin user already exists (username: {existing_admin.username})")
            response = input("Do you want to create another admin? (yes/no): ")
            if response.lower() not in ['yes', 'y']:
                print("Aborted.")
                return

        # Get username
        while True:
            username = input("\nEnter admin username: ").strip()
            if not username:
                print("Username cannot be empty.")
                continue

            # Check if username exists
            if Admin.query.filter_by(username=username).first():
                print(f"Username '{username}' already exists. Choose another.")
                continue

            break

        # Get password
        while True:
            password = getpass.getpass("Enter admin password: ")
            if len(password) < 8:
                print("Password must be at least 8 characters long.")
                continue

            password_confirm = getpass.getpass("Confirm password: ")
            if password != password_confirm:
                print("Passwords do not match.")
                continue

            break

        # Create admin
        admin = Admin(username=username)
        admin.set_password(password)

        db.session.add(admin)
        db.session.commit()

        print(f"\n✓ Admin user '{username}' created successfully!")
        print(f"  ID: {admin.id}")
        print(f"  Created: {admin.created_at}")
        print("\nYou can now log in to the admin panel.")


if __name__ == '__main__':
    try:
        create_admin()
    except KeyboardInterrupt:
        print("\n\nAborted.")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ Error: {e}")
        sys.exit(1)
