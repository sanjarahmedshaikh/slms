const BorrowTransaction = require('../models/BorrowTransaction');
const Book = require('../models/Book');
const User = require('../models/User');
const Fine = require('../models/Fine');
const Reservation = require('../models/Reservation');
const ApiResponse = require('../utils/apiResponse');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const escapeRegExp = require('../utils/escapeRegExp');

const issueBook = async (req, res, next) => {
  try {
    const { userId, memberId, bookId, isbn, days = 14 } = req.body;
    const userIdentifier = userId || memberId;
    const bookIdentifier = bookId || isbn;

    if (!userIdentifier || !bookIdentifier) {
      return ApiResponse.error(res, 'Please provide Member ID / User ID and Book ISBN / Book ID.', 400);
    }

    let user = null;
    if (mongoose.Types.ObjectId.isValid(userIdentifier)) {
      user = await User.findById(userIdentifier);
    }
    if (!user) {
      const escapedUser = escapeRegExp(userIdentifier);
      user = await User.findOne({
        $or: [
          { memberId: { $regex: new RegExp(`^${escapedUser}$`, 'i') } },
          { email: { $regex: new RegExp(`^${escapedUser}$`, 'i') } }
        ]
      });
    }

    if (!user) {
      return ApiResponse.error(res, `User not found with Member ID / Email "${userIdentifier}"`, 404);
    }

    let book = null;
    if (mongoose.Types.ObjectId.isValid(bookIdentifier)) {
      book = await Book.findById(bookIdentifier);
    }
    if (!book) {
      const escapedBook = escapeRegExp(bookIdentifier);
      book = await Book.findOne({
        $or: [
          { isbn: { $regex: new RegExp(`^${escapedBook}$`, 'i') } },
          { title: { $regex: new RegExp(escapedBook, 'i') } }
        ]
      });
    }

    if (!book) {
      return ApiResponse.error(res, `Book not found with ISBN / Title "${bookIdentifier}"`, 404);
    }

    if (book.availableCopies <= 0) {
      return ApiResponse.error(res, `Book "${book.title}" is currently out of stock.`, 400);
    }

    // Check user active loans count
    const activeLoans = await BorrowTransaction.countDocuments({ user: user._id, status: 'issued' });
    const maxLimit = user.role === 'faculty' ? 7 : 3;

    if (activeLoans >= maxLimit) {
      return ApiResponse.error(res, `Loan limit reached for ${user.fullName}. Maximum allowed for ${user.role}: ${maxLimit} books.`, 400);
    }

    // Check unpaid fines
    const unpaidFine = await Fine.findOne({ user: user._id, status: 'unpaid' });
    if (unpaidFine) {
      return ApiResponse.error(res, `User ${user.fullName} has unpaid fine of ₹${unpaidFine.amount.toFixed(2)}. Please clear fine before issuing books.`, 400);
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Number(days));

    const transaction = await BorrowTransaction.create({
      user: user._id,
      book: book._id,
      issuedBy: req.user ? req.user.id : user._id,
      dueDate
    });

    // Atomic decrement of available copies
    book.availableCopies = Math.max(0, book.availableCopies - 1);
    await book.save();

    // Auto-fulfill any pending hold reservation for this user and book
    await Reservation.updateMany(
      { user: user._id, book: book._id, status: 'pending' },
      { status: 'fulfilled' }
    );

    await Notification.create({
      recipient: user._id,
      title: 'Book Issued Successfully',
      message: `You have borrowed "${book.title}". Due date: ${dueDate.toDateString()}`,
      type: 'system'
    });

    await AuditLog.create({
      performedBy: req.user ? req.user.id : user._id,
      action: 'ISSUE_BOOK',
      module: 'TRANSACTIONS',
      details: { transactionId: transaction._id, userId: user._id, bookId: book._id }
    });

    return ApiResponse.success(res, transaction, `Book "${book.title}" issued to ${user.fullName} (${user.memberId}) successfully!`, 201);
  } catch (error) {
    next(error);
  }
};

const returnBook = async (req, res, next) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return ApiResponse.error(res, 'Transaction ID is required for return.', 400);
    }

    let transaction = null;
    if (mongoose.Types.ObjectId.isValid(transactionId)) {
      transaction = await BorrowTransaction.findById(transactionId).populate('book user');
    }
    if (!transaction) {
      transaction = await BorrowTransaction.findOne({ _id: transactionId }).populate('book user');
    }

    if (!transaction) {
      return ApiResponse.error(res, `Transaction record "${transactionId}" not found.`, 404);
    }

    if (transaction.status === 'returned') {
      return ApiResponse.error(res, 'This book has already been returned.', 400);
    }

    const returnDate = new Date();
    transaction.returnDate = returnDate;
    transaction.status = 'returned';
    transaction.returnedTo = req.user ? req.user.id : null;
    await transaction.save();

    // Update book stock atomically
    const book = await Book.findById(transaction.book._id);
    if (book) {
      book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
      await book.save();

      // Check if there are pending reservations for this book & notify top queue user
      const topReservation = await Reservation.findOne({ book: book._id, status: 'pending' }).sort({ queuePosition: 1 }).populate('user');
      if (topReservation && topReservation.user) {
        await Notification.create({
          recipient: topReservation.user._id,
          title: 'Reserved Book Now Available!',
          message: `The book "${book.title}" you placed on hold is now available for pickup at the library desk!`,
          type: 'system'
        });
      }
    }

    // Check fine calculation (₹10 / day)
    let fineRecord = null;
    if (returnDate > transaction.dueDate) {
      const diffTime = returnDate.getTime() - transaction.dueDate.getTime();
      const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const fineRate = parseFloat(process.env.FINE_RATE_PER_DAY) || 10.0;
      const amount = overdueDays * fineRate;

      fineRecord = await Fine.create({
        transaction: transaction._id,
        user: transaction.user._id,
        amount,
        overdueDays,
        status: 'unpaid'
      });

      await Notification.create({
        recipient: transaction.user._id,
        title: 'Overdue Fine Incurred',
        message: `Book "${transaction.book.title}" returned ${overdueDays} days late. Fine amount: ₹${amount.toFixed(2)}.`,
        type: 'fine_added'
      });
    }

    await AuditLog.create({
      performedBy: req.user ? req.user.id : null,
      action: 'RETURN_BOOK',
      module: 'TRANSACTIONS',
      details: { transactionId: transaction._id, fineCalculated: fineRecord ? fineRecord.amount : 0 }
    });

    return ApiResponse.success(res, { transaction, fine: fineRecord }, 'Book returned successfully!');
  } catch (error) {
    next(error);
  }
};

const getMyTransactions = async (req, res, next) => {
  try {
    const transactions = await BorrowTransaction.find({ user: req.user.id })
      .populate('book', 'title isbn authors coverImageUrl shelfLocation')
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, transactions, 'Borrowing history retrieved');
  } catch (error) {
    next(error);
  }
};

const getAllTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const status = req.query.status || '';

    const query = {};
    if (status) query.status = status;

    const total = await BorrowTransaction.countDocuments(query);
    const transactions = await BorrowTransaction.find(query)
      .populate('user', 'fullName email memberId role department')
      .populate('book', 'title isbn authors coverImageUrl')
      .populate('issuedBy', 'fullName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return ApiResponse.paginated(res, transactions, page, limit, total, 'Transactions fetched');
  } catch (error) {
    next(error);
  }
};

module.exports = { issueBook, returnBook, getMyTransactions, getAllTransactions };
