const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const {
    getAllPayments,
    getPaymentsByDateRange
} = require('../controllers/payment.controller');

// Payment management routes (admin only)
router.get('/', verifyToken, isAdmin, getAllPayments);
router.get('/date-range', verifyToken, isAdmin, getPaymentsByDateRange);

module.exports = router; 