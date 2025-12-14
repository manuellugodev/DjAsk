from flask import Blueprint, request, jsonify
from config.database import db
from models.admin import Admin
from utils.jwt_utils import generate_token, token_required
from datetime import datetime

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
def login():
    """Admin login endpoint"""
    data = request.get_json()

    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    # Find admin by username
    admin = Admin.query.filter_by(username=username).first()

    if not admin or not admin.check_password(password):
        return jsonify({'error': 'Invalid credentials'}), 401

    # Update last login
    admin.last_login = datetime.utcnow()
    db.session.commit()

    # Generate token
    token = generate_token(admin.id, admin.username)

    return jsonify({
        'token': token,
        'admin': admin.to_dict(),
        'expires_in': 86400  # 24 hours in seconds
    }), 200


@auth_bp.route('/verify', methods=['GET'])
@token_required
def verify_token(current_admin):
    """Verify if token is still valid"""
    return jsonify({
        'valid': True,
        'admin': current_admin.to_dict()
    }), 200


@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout(current_admin):
    """Logout endpoint (client-side token removal)"""
    # JWT is stateless, so logout is handled client-side
    # This endpoint exists for logging purposes
    return jsonify({'message': 'Logged out successfully'}), 200
