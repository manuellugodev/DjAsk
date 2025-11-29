from config.database import db
from datetime import datetime
import json

class Response(db.Model):
    __tablename__ = 'responses'

    id = db.Column(db.Integer, primary_key=True)
    poll_id = db.Column(db.Integer, db.ForeignKey('polls.id'), nullable=False)
    answer = db.Column(db.Text, nullable=False)  # JSON for multiple choice, text for open-ended
    user_identifier = db.Column(db.String(100))  # IP or session ID to prevent duplicates
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def get_answer(self):
        """Parse answer from JSON if it's multiple choice"""
        try:
            return json.loads(self.answer)
        except (json.JSONDecodeError, TypeError):
            return self.answer

    def set_answer(self, answer_data):
        """Set answer as JSON string if it's a list, otherwise as text"""
        if isinstance(answer_data, (list, dict)):
            self.answer = json.dumps(answer_data)
        else:
            self.answer = str(answer_data)

    def to_dict(self):
        """Convert response to dictionary"""
        return {
            'id': self.id,
            'poll_id': self.poll_id,
            'answer': self.get_answer(),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
