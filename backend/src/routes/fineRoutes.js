const express = require('express');
const router = express.Router();
const { getAllFines, getMyFines, updateFineStatus } = require('../controllers/fineController');
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/rbacMiddleware');

router.use(protect);

router.get('/my-fines', getMyFines);
router.get('/', restrictTo('super_admin', 'librarian'), getAllFines);
router.patch('/:id/pay', restrictTo('super_admin', 'librarian'), updateFineStatus);

module.exports = router;
