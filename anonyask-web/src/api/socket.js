import { io } from 'socket.io-client';

const USE_MOCK = false;

// No-op socket used in mock mode — event handlers attach but never fire
const noop = () => {};
const mockSocket = { on: noop, off: noop, emit: noop, connected: false, disconnect: noop };

let _socket = null;

export function getSocket() {
  return _socket;
}

export function connectSocket(token) {
  if (USE_MOCK) { _socket = mockSocket; return _socket; }
  if (_socket?.connected) return _socket;
  _socket = io('http://localhost:4000', {
    auth: { token },
    transports: ['websocket', 'polling'],
  });
  return _socket;
}

export function disconnectSocket() {
  if (USE_MOCK) { _socket = null; return; }
  if (_socket) {
    _socket.disconnect();
    _socket = null;
  }
}
