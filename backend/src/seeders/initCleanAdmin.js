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

dotenv.config({ path: path.join(__dirname, '../../.env') });

const initCleanDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI || '';
    mongoUri = mongoUri.replace(/^["']|["']$/g, '');

    console.log('Connecting to MongoDB Atlas to clear dummy data...');
    await mongoose.connect(mongoUri);

    // Wipe all dummy data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Book.deleteMany({}),
      BorrowTransaction.deleteMany({}),
      Fine.deleteMany({}),
      Reservation.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    console.log('Cleared all books, transactions, fines, reservations, and dummy accounts.');

    // Create Initial System Super Admin
    const admin = await User.create({
      fullName: 'Super Admin',
      email: 'admin@slms.com',
      password: 'admin123',
      role: 'super_admin',
      memberId: 'ADM-000001',
      department: 'Library Administration',
      phone: '+91 98765 43210'
    });

    // Create Base Categories
    await Category.insertMany([
      { name: 'Computer Science', code: 'CS', description: 'Software engineering, algorithms, systems' },
      { name: 'Artificial Intelligence', code: 'AI', description: 'Machine learning, neural networks' },
      { name: 'Business & Management', code: 'BUS', description: 'Economics, startup, leadership' },
      { name: 'Physics & Math', code: 'PHY', description: 'Mathematics, physical sciences' },
      { name: 'General Literature', code: 'LIT', description: 'Fiction, non-fiction, arts' }
    ]);

    await AuditLog.create({
      performedBy: admin._id,
      action: 'CLEAN_DB_INIT',
      module: 'DATABASE',
      details: { message: 'Database initialized for manual user data entry.' }
    });

    console.log('----------------------------------------------------');
    console.log('✨ CLEAN DATABASE INITIALIZED FOR MANUAL ENTRY!');
    console.log('----------------------------------------------------');
    console.log('Super Admin Credentials:');
    console.log(' - Email:    admin@slms.com');
    console.log(' - Password: admin123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (err) {
    console.error('Initialization failed:', err);
    process.exit(1);
  }
};

initCleanDB();
