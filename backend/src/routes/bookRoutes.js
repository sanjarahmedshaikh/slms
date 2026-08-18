const express = require('express');
const router = express.Router();
const { getAllBooks, getBookById, createBook, updateBook, deleteBook, getCategories } = require('../controllers/bookController');
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/rbacMiddleware');

router.get('/', getAllBooks);
router.get('/categories', getCategories);
router.get('/:id', getBookById);

router.use(protect);
router.post('/', restrictTo('super_admin', 'librarian'), createBook);
router.put('/:id', restrictTo('super_admin', 'librarian'), updateBook);
router.delete('/:id', restrictTo('super_admin', 'librarian'), deleteBook);

module.exports = router;
