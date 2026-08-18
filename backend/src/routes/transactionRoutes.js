const express = require('express');
const router = express.Router();
const { issueBook, returnBook, getMyTransactions, getAllTransactions } = require('../controllers/transactionController');
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/rbacMiddleware');

router.use(protect);

router.post('/issue', restrictTo('super_admin', 'librarian'), issueBook);
router.post('/return', restrictTo('super_admin', 'librarian'), returnBook);
router.get('/my-history', getMyTransactions);
router.get('/', restrictTo('super_admin', 'librarian'), getAllTransactions);

module.exports = router;
