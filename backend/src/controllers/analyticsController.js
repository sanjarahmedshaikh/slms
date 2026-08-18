const Book = require('../models/Book');
const User = require('../models/User');
const BorrowTransaction = require('../models/BorrowTransaction');
const Fine = require('../models/Fine');
const Reservation = require('../models/Reservation');
const AuditLog = require('../models/AuditLog');
const Category = require('../models/Category');
const ApiResponse = require('../utils/apiResponse');

const getDashboardStats = async (req, res, next) => {
  try {
    const [totalBooks, issuedBooks, totalUsers, pendingReservations, auditLogs, activeHoldQueue] = await Promise.all([
      Book.countDocuments(),
      BorrowTransaction.countDocuments({ status: 'issued' }),
      User.countDocuments(),
      Reservation.countDocuments({ status: 'pending' }),
      AuditLog.find().populate('performedBy', 'fullName email role memberId').sort({ createdAt: -1 }).limit(10),
      Reservation.find({ status: 'pending' })
        .populate('user', 'fullName memberId email department')
        .populate('book', 'title isbn')
        .sort({ createdAt: -1 })
        .limit(6)
    ]);

    const books = await Book.find();
    const totalCopies = books.reduce((sum, b) => sum + (b.totalCopies || 0), 0);
    const availableCopies = books.reduce((sum, b) => sum + (b.availableCopies || 0), 0);

    const fines = await Fine.find();
    const totalFineCollected = fines.filter((f) => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
    const totalFineOutstanding = fines.filter((f) => f.status === 'unpaid').reduce((sum, f) => sum + f.amount, 0);

    // Categories breakdown
    const categories = await Category.find();
    const categoryStats = await Promise.all(
      categories.map(async (cat) => {
        const count = await Book.countDocuments({ category: cat._id });
        return { name: cat.name, count };
      })
    );

    return ApiResponse.success(
      res,
      {
        kpis: {
          totalBooks,
          totalCopies,
          availableCopies,
          issuedBooks,
          totalUsers,
          pendingReservations,
          totalFineCollected,
          totalFineOutstanding
        },
        categoryStats,
        recentActivities: auditLogs,
        activeHoldQueue
      },
      'Dashboard analytics fetched'
    );
  } catch (error) {
    next(error);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;

    const total = await AuditLog.countDocuments();
    const logs = await AuditLog.find()
      .populate('performedBy', 'fullName email role memberId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return ApiResponse.paginated(res, logs, page, limit, total, 'Audit logs fetched successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getAuditLogs };
