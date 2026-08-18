const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (e) {}

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Category = require('../models/Category');
const Book = require('../models/Book');
const BorrowTransaction = require('../models/BorrowTransaction');
const Fine = require('../models/Fine');
const Reservation = require('../models/Reservation');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const wipeDatabaseCompletely = async () => {
  try {
    let mongoUri = process.env.MONGO_URI || '';
    mongoUri = mongoUri.replace(/^["']|["']$/g, '');

    console.log('⌛ Connecting to MongoDB Atlas database...');
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB Atlas.');

    console.log('🧹 Wiping ALL collections completely...');

    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Book.deleteMany({}),
      BorrowTransaction.deleteMany({}),
      Fine.deleteMany({}),
      Reservation.deleteMany({}),
      AuditLog.deleteMany({}),
      Notification.deleteMany({})
    ]);

    console.log('----------------------------------------------------');
    console.log('💥 MONGODB ATLAS DATABASE WIPED COMPLETELY! (0 RECORDS)');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to wipe MongoDB Atlas database:', err);
    process.exit(1);
  }
};

wipeDatabaseCompletely();
