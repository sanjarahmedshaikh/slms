const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/rbacMiddleware');

router.use(protect);

router.get('/', restrictTo('super_admin', 'librarian'), getAllUsers);
router.patch('/:id/role', restrictTo('super_admin'), updateUserRole);

module.exports = router;
