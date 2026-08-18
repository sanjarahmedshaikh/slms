const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    reservationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'fulfilled', 'cancelled', 'expired'],
      default: 'pending'
    },
    queuePosition: {
      type: Number,
      default: 1
    },
    notifiedAt: {
      type: Date
    },
    expiresAt: {
      type: Date
    }
  },
  { timestamps: true }
);

reservationSchema.index({ user: 1, status: 1 });
reservationSchema.index({ book: 1, status: 1, queuePosition: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
