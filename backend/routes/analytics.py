from flask import Blueprint, jsonify
from config.database import db
from models.poll import Poll
from models.response import Response
from sqlalchemy import func
import json

analytics_bp = Blueprint('analytics', __name__)
analytics_bp.url_map.strict_slashes = False

@analytics_bp.route('/<int:poll_id>/', methods=['GET'])
@analytics_bp.route('/<int:poll_id>', methods=['GET'])
def get_poll_analytics(poll_id):
    """Get analytics for a specific poll"""
    poll = Poll.query.get_or_404(poll_id)

    total_responses = Response.query.filter_by(poll_id=poll_id).count()

    analytics_data = {
        'poll_id': poll_id,
        'poll_title': poll.title,
        'poll_type': poll.poll_type,
        'total_responses': total_responses,
        'is_active': poll.is_active,
        'created_at': poll.created_at.isoformat() if poll.created_at else None
    }

    if poll.poll_type == 'multiple_choice':
        # Calculate vote counts for each option
        responses = Response.query.filter_by(poll_id=poll_id).all()

        vote_counts = {}
        options = poll.get_options()

        # Initialize counts
        for option in options:
            vote_counts[option] = 0

        # Count votes
        for response in responses:
            answer = response.get_answer()
            if isinstance(answer, list):
                # Multiple selections
                for ans in answer:
                    if ans in vote_counts:
                        vote_counts[ans] += 1
            else:
                # Single selection
                if answer in vote_counts:
                    vote_counts[answer] += 1

        analytics_data['vote_distribution'] = vote_counts
        analytics_data['options'] = options

    elif poll.poll_type == 'open_text':
        # Get all text responses
        responses = Response.query.filter_by(poll_id=poll_id).order_by(Response.created_at.desc()).all()
        analytics_data['text_responses'] = [
            {
                'id': r.id,
                'answer': r.get_answer(),
                'created_at': r.created_at.isoformat() if r.created_at else None
            }
            for r in responses
        ]

    return jsonify(analytics_data)

@analytics_bp.route('/summary/', methods=['GET'])
@analytics_bp.route('/summary', methods=['GET'])
def get_summary():
    """Get summary analytics for all polls"""
    total_polls = Poll.query.count()
    active_polls = Poll.query.filter_by(is_active=True).count()
    total_responses = Response.query.count()

    recent_polls = Poll.query.order_by(Poll.created_at.desc()).limit(5).all()

    return jsonify({
        'total_polls': total_polls,
        'active_polls': active_polls,
        'total_responses': total_responses,
        'recent_polls': [poll.to_dict() for poll in recent_polls]
    })
