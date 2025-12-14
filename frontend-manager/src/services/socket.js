import { io } from 'socket.io-client';

// Dynamically use the same host that served the page, but port 5000 for WebSocket
const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  const hostname = window.location.hostname;
  return `http://${hostname}:5000`;
};

const SOCKET_URL = getSocketUrl();

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    // Reuse existing connection if already connected
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

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
