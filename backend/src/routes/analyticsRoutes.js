const express = require('express');
const router = express.Router();
const { getDashboardStats, getAuditLogs } = require('../controllers/analyticsController');
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/rbacMiddleware');

router.use(protect);
router.get('/dashboard', restrictTo('super_admin', 'librarian'), getDashboardStats);
router.get('/audit-logs', restrictTo('super_admin', 'librarian'), getAuditLogs);

module.exports = router;
