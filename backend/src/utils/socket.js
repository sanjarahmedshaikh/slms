const { Server } = require('socket.io');
const logger = require('./logger');

let io = null;

const initSocket = (httpServer, allowedOrigins = []) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          callback(null, true);
        } else {
          callback(null, true);
        }
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    logger.info(`Socket client connected: ${socket.id}`);

    socket.on('join_user_room', (userId) => {
      if (userId) {
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
