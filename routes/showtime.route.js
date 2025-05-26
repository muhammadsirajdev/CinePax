const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const {
    addShowtime,
    getAllShowtimes,
    deleteShowtime
} = require('../controllers/showtime.controller');

// Showtime management routes
router.post('/', verifyToken, isAdmin, addShowtime);
router.get('/', getAllShowtimes); // Public route
router.delete('/:id', verifyToken, isAdmin, deleteShowtime);

module.exports = router; 