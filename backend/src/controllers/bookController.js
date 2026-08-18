const Book = require('../models/Book');
const Category = require('../models/Category');
const ApiResponse = require('../utils/apiResponse');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');
const escapeRegExp = require('../utils/escapeRegExp');

const getAllBooks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const status = req.query.status || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const query = {};

    if (search) {
      const escapedSearch = escapeRegExp(search);
      query.$or = [
        { title: { $regex: escapedSearch, $options: 'i' } },
        { isbn: { $regex: escapedSearch, $options: 'i' } },
        { authors: { $elemMatch: { $regex: escapedSearch, $options: 'i' } } },
        { publisher: { $regex: escapedSearch, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .populate('category', 'name code')
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    return ApiResponse.paginated(res, books, page, limit, total, 'Books fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).populate('category', 'name code description');
    if (!book) {
      return ApiResponse.error(res, 'Book not found', 404);
    }
    return ApiResponse.success(res, book, 'Book details retrieved');
  } catch (error) {
    next(error);
  }
};

const createBook = async (req, res, next) => {
  try {
    const { title, isbn, authors, publisher, publicationYear, category, genres, totalCopies, shelfLocation, coverImageUrl, description } = req.body;

    if (!title || !isbn) {
      return ApiResponse.error(res, 'Title and ISBN are required fields.', 400);
    }

    const existingIsbn = await Book.findOne({ isbn });
    if (existingIsbn) {
      return ApiResponse.error(res, `A book with ISBN "${isbn}" already exists in the database.`, 400);
    }

    // Resolve Category ObjectId automatically
    let categoryObjectId = null;
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        categoryObjectId = category;
      } else {
        let catDoc = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
        if (!catDoc) {
          catDoc = await Category.create({
            name: category,
            code: category.substring(0, 4).toUpperCase() || 'GEN'
          });
        }
        categoryObjectId = catDoc._id;
      }
    } else {
      let defaultCat = await Category.findOne();
      if (defaultCat) {
        categoryObjectId = defaultCat._id;
      }
    }

    const copiesCount = Number(totalCopies) > 0 ? Number(totalCopies) : 1;

    const book = await Book.create({
      title,
      isbn,
      authors: Array.isArray(authors) ? authors : authors ? [authors] : ['Unknown Author'],
      publisher: publisher || 'General Publisher',
      publicationYear: Number(publicationYear) || new Date().getFullYear(),
      category: categoryObjectId,
      genres: Array.isArray(genres) ? genres : genres ? [genres] : ['General'],
      totalCopies: copiesCount,
      availableCopies: copiesCount,
      shelfLocation: shelfLocation || 'Rack A - Shelf 1',
      coverImageUrl: coverImageUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
      description: description || ''
    });

    await AuditLog.create({
      performedBy: req.user ? req.user.id : null,
      action: 'CREATE_BOOK',
      module: 'BOOKS',
      details: { bookId: book._id, title: book.title, isbn: book.isbn }
    });

    return ApiResponse.success(res, book, 'Book created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return ApiResponse.error(res, 'Book not found', 404);
    }

    Object.assign(book, req.body);
    await book.save();

    await AuditLog.create({
      performedBy: req.user ? req.user.id : null,
      action: 'UPDATE_BOOK',
      module: 'BOOKS',
      details: { bookId: book._id, title: book.title }
    });

    return ApiResponse.success(res, book, 'Book updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return ApiResponse.error(res, 'Book not found', 404);
    }

    await AuditLog.create({
      performedBy: req.user ? req.user.id : null,
      action: 'DELETE_BOOK',
      module: 'BOOKS',
      details: { bookId: book._id, title: book.title }
    });

    return ApiResponse.success(res, null, 'Book deleted successfully');
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return ApiResponse.success(res, categories, 'Categories fetched');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllBooks, getBookById, createBook, updateBook, deleteBook, getCategories };
