const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('./logger');

let io = null;

const initSocket = (httpServer, allowedOrigins = []) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          callback(null, true);
        } else {
          if (process.env.NODE_ENV !== 'production') {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'), false);
          }
        }
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Socket connection handshake authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
    if (token && typeof token === 'string') {
      try {
        const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
        const secret = (process.env.JWT_SECRET || 'slms_dev_secure_jwt_secret_key_change_for_production_2026').trim();
        const decoded = jwt.verify(cleanToken, secret);
        socket.user = decoded;
      } catch (err) {
        // Proceed but socket remains unauthenticated
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    logger.info(`Socket client connected: ${socket.id}`);

    socket.on('join_user_room', (userId) => {
      if (userId) {
        // Restrict room joining to the authenticated user or admins
        if (socket.user && socket.user.id !== userId && socket.user.role !== 'super_admin' && socket.user.role !== 'librarian') {
          logger.warn(`Socket ${socket.id} unauthorized join attempt for user_${userId}`);
          return;
        }
        socket.join(`user_${userId}`);
        logger.info(`Socket ${socket.id} joined room user_${userId}`);
      }
    });

    socket.on('leave_user_room', (userId) => {
      if (userId) {
        socket.leave(`user_${userId}`);
        logger.info(`Socket ${socket.id} left room user_${userId}`);
      }
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket client disconnected: ${socket.id} (reason: ${reason})`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    logger.warn('Socket.IO is not initialized yet!');
  }
  return io;
};

const emitNotification = (recipientId, notification) => {
  if (io && recipientId) {
    io.to(`user_${recipientId}`).emit('notification:new', notification);
    io.emit('notification:broadcast', notification);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitNotification
};
