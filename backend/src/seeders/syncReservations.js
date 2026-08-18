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
const Reservation = require('../models/Reservation');
const BorrowTransaction = require('../models/BorrowTransaction');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const syncReservations = async () => {
  try {
    let mongoUri = process.env.MONGO_URI || '';
    mongoUri = mongoUri.replace(/^["']|["']$/g, '');

    console.log('Connecting to MongoDB Atlas to sync reservations...');
    await mongoose.connect(mongoUri);

    const pendingList = await Reservation.find({ status: 'pending' });
    let count = 0;
    for (const r of pendingList) {
      const activeLoan = await BorrowTransaction.findOne({ user: r.user, book: r.book, status: 'issued' });
      if (activeLoan) {
        r.status = 'fulfilled';
        await r.save();
        count++;
      }
    }

    console.log(`Successfully synced ${count} pending reservations to FULFILLED!`);
    process.exit(0);
  } catch (err) {
    console.error('Sync failed:', err);
    process.exit(1);
  }
};

syncReservations();
