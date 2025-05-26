const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const {
    addTheater,
    getAllTheaters,
    deleteTheater
} = require('../controllers/theater.controller');

// Theater management routes
router.post('/', verifyToken, isAdmin, addTheater);
router.get('/', getAllTheaters); // Public route
router.delete('/:id', verifyToken, isAdmin, deleteTheater);

module.exports = router; 