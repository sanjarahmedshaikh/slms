const Notification = require('../models/Notification');
const ApiResponse = require('../utils/apiResponse');
const AuditLog = require('../models/AuditLog');

const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({ recipient: req.user.id, isRead: false });

    return ApiResponse.success(res, { notifications, unreadCount }, 'Notifications retrieved');
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) return ApiResponse.error(res, 'Notification not found', 404);

    await AuditLog.create({
      performedBy: req.user.id,
      action: 'NOTIFICATION_READ',
      module: 'NOTIFICATIONS',
      details: { notificationId: notification._id, title: notification.title }
    });

    return ApiResponse.success(res, notification, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyNotifications, markAsRead };
