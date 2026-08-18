const mongoose = require('mongoose');

const fineSchema = new mongoose.Schema(
  {
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BorrowTransaction',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    overdueDays: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['unpaid', 'paid', 'waived'],
      default: 'unpaid',
      index: true
    },
    paidAt: {
      type: Date
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'online', 'waived', 'none'],
      default: 'none'
    },
    transactionReference: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

fineSchema.index({ user: 1, status: 1 });
fineSchema.index({ transaction: 1 });

module.exports = mongoose.model('Fine', fineSchema);
