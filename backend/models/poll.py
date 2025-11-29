from config.database import db
from datetime import datetime
import json

class Poll(db.Model):
    __tablename__ = 'polls'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    poll_type = db.Column(db.String(50), nullable=False)  # 'multiple_choice' or 'open_text'
    options = db.Column(db.Text)  # JSON string for multiple choice options
    is_active = db.Column(db.Boolean, default=True)
    allow_multiple = db.Column(db.Boolean, default=False)  # Allow multiple selections
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    responses = db.relationship('Response', backref='poll', lazy=True, cascade='all, delete-orphan')

    def get_options(self):
        """Parse options from JSON string"""
        if self.options:
            return json.loads(self.options)
        return []

    def set_options(self, options_list):
        """Set options as JSON string"""
        self.options = json.dumps(options_list)

    def to_dict(self):
        """Convert poll to dictionary"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'poll_type': self.poll_type,
            'options': self.get_options(),
            'is_active': self.is_active,
            'allow_multiple': self.allow_multiple,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'response_count': len(self.responses)
        }
