from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
from datetime import datetime
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

# Disable strict slashes to prevent 308 redirects
app.url_map.strict_slashes = False

# Configure CORS to allow all origins and methods
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize database
from config.database import init_db

# Import models BEFORE initializing database (so tables are created)
from models.poll import Poll
from models.response import Response

db = init_db(app)

# Verify tables were created
with app.app_context():
    from sqlalchemy import inspect
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    print(f"✓ Database initialized. Tables: {tables}")

# Import routes
from routes.polls import polls_bp, set_socketio
from routes.analytics import analytics_bp

# Pass socketio to routes for real-time updates
set_socketio(socketio)

# Register blueprints
app.register_blueprint(polls_bp, url_prefix='/api/polls')
app.register_blueprint(analytics_bp, url_prefix='/api/analytics')

# WebSocket events
@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('connection_response', {'data': 'Connected to poll server'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('join_poll')
def handle_join_poll(data):
    poll_id = data.get('poll_id')
    join_room(f'poll_{poll_id}')
    emit('joined_poll', {'poll_id': poll_id})

@socketio.on('leave_poll')
def handle_leave_poll(data):
    poll_id = data.get('poll_id')
    leave_room(f'poll_{poll_id}')

@app.route('/')
def index():
    return jsonify({
        'message': 'djask - Interactive Polling API',
        'version': '1.0.0',
        'status': 'running'
    })

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
