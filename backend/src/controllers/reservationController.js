const Reservation = require('../models/Reservation');
const Book = require('../models/Book');
const BorrowTransaction = require('../models/BorrowTransaction');
const ApiResponse = require('../utils/apiResponse');
const AuditLog = require('../models/AuditLog');

const createReservation = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    const book = await Book.findById(bookId);
    if (!book) return ApiResponse.error(res, 'Book not found', 404);

    const existingReservation = await Reservation.findOne({
      user: userId,
      book: bookId,
      status: 'pending'
    });

    if (existingReservation) {
      return ApiResponse.error(res, 'You already have an active hold reservation for this book', 400);
    }

    // Check if user already has an active issued loan for this book
    const activeLoan = await BorrowTransaction.findOne({ user: userId, book: bookId, status: 'issued' });
    if (activeLoan) {
      return ApiResponse.error(res, 'You currently have an active borrowed loan for this book.', 400);
    }

    const pendingCount = await Reservation.countDocuments({ book: bookId, status: 'pending' });

    const reservation = await Reservation.create({
      user: userId,
      book: bookId,
      queuePosition: pendingCount + 1
    });

    await AuditLog.create({
      performedBy: userId,
      action: 'RESERVE_BOOK',
      module: 'RESERVATIONS',
      details: { reservationId: reservation._id, bookId, title: book.title }
    });

    return ApiResponse.success(res, reservation, 'Book reserved successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getMyReservations = async (req, res, next) => {
  try {
    // Dynamic Sync: auto-fulfill any pending reservations if an active loan exists
    const pendingResList = await Reservation.find({ user: req.user.id, status: 'pending' });
    for (const r of pendingResList) {
      const activeLoan = await BorrowTransaction.findOne({ user: req.user.id, book: r.book, status: 'issued' });
      if (activeLoan) {
        r.status = 'fulfilled';
        await r.save();
      }
    }

    // Return ONLY active pending hold queue reservations
    const reservations = await Reservation.find({ user: req.user.id, status: 'pending' })
      .populate('book', 'title isbn authors coverImageUrl availableCopies status')
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, reservations, 'Pending hold reservations fetched');
  } catch (error) {
    next(error);
  }
};

const getAllReservations = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    // Dynamic Sync: auto-fulfill pending reservations system-wide if loans are issued
    const pendingResList = await Reservation.find({ status: 'pending' });
    for (const r of pendingResList) {
      const activeLoan = await BorrowTransaction.findOne({ user: r.user, book: r.book, status: 'issued' });
      if (activeLoan) {
        r.status = 'fulfilled';
        await r.save();
      }
    }

    const reservations = await Reservation.find(query)
      .populate('user', 'fullName email memberId role department phone')
      .populate('book', 'title isbn authors coverImageUrl availableCopies status')
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, reservations, 'All student reservation queues fetched');
  } catch (error) {
    next(error);
  }
};

const cancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return ApiResponse.error(res, 'Reservation not found', 404);

    reservation.status = 'cancelled';
    await reservation.save();

    await AuditLog.create({
      performedBy: req.user.id,
      action: 'CANCEL_RESERVATION',
      module: 'RESERVATIONS',
      details: { reservationId: reservation._id }
    });

    return ApiResponse.success(res, reservation, 'Reservation cancelled');
  } catch (error) {
    next(error);
  }
};

module.exports = { createReservation, getMyReservations, getAllReservations, cancelReservation };
