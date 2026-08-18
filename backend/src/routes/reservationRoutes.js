const express = require('express');
const router = express.Router();
const { createReservation, getMyReservations, getAllReservations, cancelReservation } = require('../controllers/reservationController');
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/rbacMiddleware');

router.use(protect);

router.post('/', createReservation);
router.get('/my-reservations', getMyReservations);
router.get('/', restrictTo('super_admin', 'librarian'), getAllReservations);
router.delete('/:id', cancelReservation);

module.exports = router;
