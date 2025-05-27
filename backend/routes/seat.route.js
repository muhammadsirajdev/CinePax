const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const {
    addSeat,
    getAllSeats,
    deleteSeat
} = require('../controllers/seat.controller');

// Seat management routes
router.post('/', verifyToken, isAdmin, addSeat);
router.get('/', getAllSeats); // Public route
router.delete('/:id', verifyToken, isAdmin, deleteSeat);

module.exports = router; 