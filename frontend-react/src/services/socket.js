import { io } from 'socket.io-client';

let socket = null;

export const getSocketServerUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api(?:\/v1)?\/?$/, '');
  }
  if (typeof window !== 'undefined' && window.VITE_API_URL) {
    return window.VITE_API_URL.replace(/\/api(?:\/v1)?\/?$/, '');
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:5000';
};

export const initializeSocket = (userId) => {
  if (!socket) {
    const serverUrl = getSocketServerUrl();
    socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      if (userId) {
        socket.emit('join_user_room', userId);
      }
    });

    socket.on('connect_error', (error) => {
      console.warn('Socket connection warning:', error.message);
    });
  } else if (userId) {
    socket.emit('join_user_room', userId);
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
