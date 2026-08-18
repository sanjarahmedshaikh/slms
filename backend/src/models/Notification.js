const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['due_reminder', 'overdue_alert', 'fine_added', 'reservation_ready', 'system'],
      default: 'system'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    channel: {
      type: String,
      enum: ['in_app', 'email', 'both'],
      default: 'in_app'
    }
  },
  { timestamps: true }
);

notificationSchema.post('save', function (doc) {
  try {
    const { emitNotification } = require('../utils/socket');
    emitNotification(doc.recipient, doc);
  } catch (e) {}
});

module.exports = mongoose.model('Notification', notificationSchema);
