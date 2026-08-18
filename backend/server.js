const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (e) {
  // Ignore
}

const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./src/app');
const logger = require('./src/utils/logger');
const { initCronJobs } = require('./src/services/cronScheduler');
const { initSocket } = require('./src/utils/socket');

dotenv.config();

const PORT = process.env.PORT || 5000;
let MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || '';
MONGO_URI = MONGO_URI.replace(/^["']|["']$/g, '');

const startServer = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error('MongoDB Atlas URI is missing. Please set MONGODB_URI or MONGO_URI in backend/.env file.');
    }
    logger.info('Connecting to MongoDB Atlas database...');
    await mongoose.connect(MONGO_URI);
    logger.info('Connected successfully to MongoDB Atlas database!');
  } catch (err) {
    logger.error('MongoDB Atlas Connection Error:', err.message);
    process.exit(1);
  }

  // Start Cron jobs
  initCronJobs();

  // Create HTTP server & attach Socket.IO engine
  const server = http.createServer(app);
  
  const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.ADMIN_URL,
    'http://localhost:5173',
    'http://localhost:4200'
  ].filter(Boolean);

  initSocket(server, allowedOrigins);

  server.listen(PORT, () => {
    logger.info(`SLMS Backend REST API running on port ${PORT} [Mode: ${process.env.NODE_ENV || 'development'}]`);
    logger.info(`Health check endpoint: http://localhost:${PORT}/api/health`);
  });

  process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! Shutting down...', err);
    server.close(() => {
      process.exit(1);
    });
  });
};

startServer();
