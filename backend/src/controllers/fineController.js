const Fine = require('../models/Fine');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ApiResponse = require('../utils/apiResponse');
const AuditLog = require('../models/AuditLog');

const getAllFines = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const status = req.query.status || '';

    const query = {};
    if (status) query.status = status;

    const total = await Fine.countDocuments(query);
    const fines = await Fine.find(query)
      .populate('user', 'fullName email memberId department')
      .populate({
        path: 'transaction',
        populate: { path: 'book', select: 'title isbn' }
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return ApiResponse.paginated(res, fines, page, limit, total, 'Fines list retrieved');
  } catch (error) {
    next(error);
  }
};

const getMyFines = async (req, res, next) => {
  try {
    const fines = await Fine.find({ user: req.user.id })
      .populate({
        path: 'transaction',
        populate: { path: 'book', select: 'title isbn coverImageUrl' }
      })
      .sort({ createdAt: -1 });

    const totalUnpaid = fines
      .filter((f) => f.status === 'unpaid')
      .reduce((sum, f) => sum + f.amount, 0);

    return ApiResponse.success(res, { fines, totalUnpaid }, 'User fines retrieved');
  } catch (error) {
    next(error);
  }
};

const updateFineStatus = async (req, res, next) => {
  try {
    const { status, paymentMethod, transactionReference } = req.body;
    const fine = await Fine.findById(req.params.id).populate('user', 'fullName email memberId');

    if (!fine) return ApiResponse.error(res, 'Fine record not found', 404);

    const prevStatus = fine.status;
    fine.status = status || fine.status;
    fine.paymentMethod = paymentMethod || fine.paymentMethod;
    if (transactionReference) fine.transactionReference = transactionReference;
    if (status === 'paid' || status === 'waived') {
      fine.paidAt = new Date();
    }

    await fine.save();

    // If fine status changed to paid, notify admins in real-time
    if (status === 'paid' && prevStatus !== 'paid') {
      try {
        const admins = await User.find({ role: { $in: ['super_admin', 'librarian'] } });
        const payerName = fine.user ? fine.user.fullName : (req.user ? req.user.fullName : 'A user');
        for (const admin of admins) {
          await Notification.create({
            recipient: admin._id,
            title: 'Fine Payment Received',
            message: `Fine of ₹${fine.amount.toFixed(2)} was paid by ${payerName}.`,
            type: 'fine_added'
          });
        }
      } catch (notifErr) {
        // Non-blocking notification creation error logging
      }
    }

    await AuditLog.create({
      performedBy: req.user.id,
      action: 'UPDATE_FINE_STATUS',
      module: 'FINES',
      details: { fineId: fine._id, status: fine.status, amount: fine.amount }
    });

    return ApiResponse.success(res, fine, 'Fine status updated');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllFines, getMyFines, updateFineStatus };
