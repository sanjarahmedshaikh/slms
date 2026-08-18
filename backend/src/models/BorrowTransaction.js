const mongoose = require('mongoose');

const borrowTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
      index: true
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    returnedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    issueDate: {
      type: Date,
      default: Date.now,
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    returnDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['issued', 'returned', 'overdue', 'lost'],
      default: 'issued',
      index: true
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

borrowTransactionSchema.index({ user: 1, status: 1 });
borrowTransactionSchema.index({ book: 1, status: 1 });
borrowTransactionSchema.index({ dueDate: 1, status: 1 });

module.exports = mongoose.model('BorrowTransaction', borrowTransactionSchema);
