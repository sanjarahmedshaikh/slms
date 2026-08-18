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

dotenv.config({ path: path.join(__dirname, '../../.env') });

const resetAdmin = async () => {
  try {
    let mongoUri = process.env.MONGO_URI || '';
    mongoUri = mongoUri.replace(/^["']|["']$/g, '');

    console.log('Connecting to MongoDB Atlas to reset Super Admin account...');
    await mongoose.connect(mongoUri);

    let admin = await User.findOne({ email: 'admin@slms.com' });
    if (!admin) {
      admin = await User.create({
        fullName: 'Super Admin',
        email: 'admin@slms.com',
        password: 'admin123',
        role: 'super_admin',
        memberId: 'ADM-000001',
        department: 'Library Administration'
      });
      console.log('Created Super Admin account successfully!');
    } else {
      admin.password = 'admin123';
      await admin.save();
      console.log('Updated Super Admin password to admin123!');
    }

    process.exit(0);
  } catch (err) {
    console.error('Reset failed:', err);
    process.exit(1);
  }
};

resetAdmin();
