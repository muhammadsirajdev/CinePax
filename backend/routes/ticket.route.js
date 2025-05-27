const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const {
    getAllBookedTickets,
    getBookedTicketsByShowtime
} = require('../controllers/ticket.controller');

// Ticket management routes (admin only)
router.get('/', verifyToken, isAdmin, getAllBookedTickets);
router.get('/showtime/:showtimeId', verifyToken, isAdmin, getBookedTicketsByShowtime);

module.exports = router; 