
const express = require('express');
const router = express.Router();
const { signupUser, loginUser, logoutUser } = require('../controllers/customer.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

//router.get('/signup', showSignupPage);
router.post('/signup', signupUser);
//router.get('/signin', showLoginPage);
router.post('/signin', loginUser);

// Protected routes
//router.get('/logout', logoutUser); frontend will handle
router.post('/logout', verifyToken, logoutUser);

module.exports = router;

//router.get('/profile', verifyToken, getProfile);

// Example: if you add admin-specific routes later
// router.get('/admin-dashboard', verifyToken, isAdmin, adminDashboardController);


