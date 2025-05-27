const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const {
    addStaff,
    getAllStaff,
    deleteStaff
} = require('../controllers/staff.controller');

// Staff management routes
router.post('/', verifyToken, isAdmin, addStaff);
router.get('/', getAllStaff); // Public route
router.delete('/:id', verifyToken, isAdmin, deleteStaff);

module.exports = router; 