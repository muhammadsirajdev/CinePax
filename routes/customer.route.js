const express = require('express');
const router = express.Router();
const {verifyToken,isAdmin} = require('../middleware/auth.middleware');
// Example: import controllers to handle customer routes
const { getProfile } = require('../controllers/customer.controller');

router.get('/profile', verifyToken, getProfile);


// Add other protected customer routes here

module.exports = router;
