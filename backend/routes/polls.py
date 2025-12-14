from flask import Blueprint, request, jsonify
from config.database import db
from models.poll import Poll
from models.response import Response
from flask_socketio import SocketIO
from datetime import datetime
from utils.jwt_utils import token_required

polls_bp = Blueprint('polls', __name__)
#polls_bp.url_map.strict_slashes = False

# This will be set from app.py
socketio = None

def set_socketio(sio):
    global socketio
    socketio = sio

@polls_bp.route('/', methods=['GET'])
@polls_bp.route('', methods=['GET'])
def get_polls():
    """Get all polls"""
    is_active = request.args.get('active')

    if is_active is not None:
        is_active = is_active.lower() == 'true'
        polls = Poll.query.filter_by(is_active=is_active).order_by(Poll.created_at.desc()).all()
    else:
        polls = Poll.query.order_by(Poll.created_at.desc()).all()

    return jsonify([poll.to_dict() for poll in polls])

@polls_bp.route('/<int:poll_id>/', methods=['GET'])
@polls_bp.route('/<int:poll_id>', methods=['GET'])
def get_poll(poll_id):
    """Get a specific poll"""
    poll = Poll.query.get_or_404(poll_id)
    return jsonify(poll.to_dict())

@polls_bp.route('/', methods=['POST'])
@polls_bp.route('', methods=['POST'])
@token_required
def create_poll(current_admin):
    """Create a new poll"""
    data = request.get_json()

    if not data.get('title') or not data.get('poll_type'):
        return jsonify({'error': 'Title and poll_type are required'}), 400

    poll = Poll(
        title=data['title'],
        description=data.get('description', ''),
        poll_type=data['poll_type'],
        allow_multiple=data.get('allow_multiple', False)
    )

    if data['poll_type'] == 'multiple_choice':
        if not data.get('options'):
            return jsonify({'error': 'Options required for multiple choice polls'}), 400
        poll.set_options(data['options'])

    db.session.add(poll)
    db.session.commit()

    return jsonify(poll.to_dict()), 201

@polls_bp.route('/<int:poll_id>/', methods=['PUT'])
@polls_bp.route('/<int:poll_id>', methods=['PUT'])
@token_required
def update_poll(current_admin, poll_id):
    """Update a poll"""
    poll = Poll.query.get_or_404(poll_id)
    data = request.get_json()

    if 'title' in data:
        poll.title = data['title']
    if 'description' in data:
        poll.description = data['description']
    if 'is_active' in data:
        poll.is_active = data['is_active']
    if 'allow_multiple' in data:
        poll.allow_multiple = data['allow_multiple']
    if 'options' in data and poll.poll_type == 'multiple_choice':
        poll.set_options(data['options'])

    poll.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify(poll.to_dict())

@polls_bp.route('/<int:poll_id>/', methods=['DELETE'])
@polls_bp.route('/<int:poll_id>', methods=['DELETE'])
@token_required
def delete_poll(current_admin, poll_id):
    """Delete a poll"""
    poll = Poll.query.get_or_404(poll_id)
    db.session.delete(poll)
    db.session.commit()

    return jsonify({'message': 'Poll deleted successfully'}), 200

@polls_bp.route('/<int:poll_id>/responses/', methods=['POST'])
@polls_bp.route('/<int:poll_id>/responses', methods=['POST'])
def submit_response(poll_id):
    """Submit a response to a poll"""
    poll = Poll.query.get_or_404(poll_id)

    if not poll.is_active:
        return jsonify({'error': 'This poll is no longer active'}), 400

    data = request.get_json()
    answer = data.get('answer')

    if not answer:
        return jsonify({'error': 'Answer is required'}), 400

    # Optional: Check for duplicate responses by IP
    user_identifier = request.remote_addr

    response = Response(
        poll_id=poll_id,
        user_identifier=user_identifier
    )
    response.set_answer(answer)

    db.session.add(response)
    db.session.commit()

    # Emit real-time update via Socket.IO
    if socketio:
        socketio.emit('new_response', {
            'poll_id': poll_id,
            'response': response.to_dict()
        }, room=f'poll_{poll_id}')

    return jsonify(response.to_dict()), 201

@polls_bp.route('/<int:poll_id>/responses/', methods=['GET'])
@polls_bp.route('/<int:poll_id>/responses', methods=['GET'])
@token_required
def get_responses(current_admin, poll_id):
    """Get all responses for a poll"""
    poll = Poll.query.get_or_404(poll_id)
    responses = Response.query.filter_by(poll_id=poll_id).order_by(Response.created_at.desc()).all()

    return jsonify([response.to_dict() for response in responses])
