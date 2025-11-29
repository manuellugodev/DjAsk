import { io } from 'socket.io-client';

// In Docker, connect directly to localhost:5000 from browser
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  joinPoll(pollId) {
    if (this.socket) {
      this.socket.emit('join_poll', { poll_id: pollId });
    }
  }

  leavePoll(pollId) {
    if (this.socket) {
      this.socket.emit('leave_poll', { poll_id: pollId });
    }
  }

  onNewResponse(callback) {
    if (this.socket) {
      this.socket.on('new_response', callback);
    }
  }

  offNewResponse() {
    if (this.socket) {
      this.socket.off('new_response');
    }
  }
}

export default new SocketService();
