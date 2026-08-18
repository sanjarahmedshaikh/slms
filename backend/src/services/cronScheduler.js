const cron = require('node-cron');
const BorrowTransaction = require('../models/BorrowTransaction');
const Fine = require('../models/Fine');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

const initCronJobs = () => {
  // Run daily at midnight '0 0 * * *'
  cron.schedule('0 0 * * *', async () => {
    logger.info('Running Daily Overdue Fine Calculation Cron Job...');
    try {
      const now = new Date();
      const overdueTransactions = await BorrowTransaction.find({
        dueDate: { $lt: now },
        status: 'issued'
      }).populate('user book');

      for (const trans of overdueTransactions) {
        // Mark as overdue
        trans.status = 'overdue';
        await trans.save();

        const diffTime = Math.abs(now - trans.dueDate);
        const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const fineAmount = overdueDays * (parseFloat(process.env.FINE_RATE_PER_DAY) || 1.0);

        let fine = await Fine.findOne({ transaction: trans._id });
        if (!fine) {
          await Fine.create({
            transaction: trans._id,
            user: trans.user._id,
            amount: fineAmount,
            overdueDays,
            status: 'unpaid'
          });
        } else if (fine.status === 'unpaid') {
          fine.amount = fineAmount;
          fine.overdueDays = overdueDays;
          await fine.save();
        }

        // Send alert
        await Notification.create({
          recipient: trans.user._id,
          title: 'Overdue Book Reminder',
          message: `Your book "${trans.book.title}" is ${overdueDays} days overdue. Current fine: $${fineAmount}.`,
          type: 'overdue_alert'
        });
      }
      logger.info(`Processed ${overdueTransactions.length} overdue transactions.`);
    } catch (err) {
      logger.error('Error executing fine calculation cron job', err);
    }
  });
};

module.exports = { initCronJobs };
