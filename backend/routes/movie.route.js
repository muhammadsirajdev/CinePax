const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const {
    addMovie,
    getAllMovies,
    updateMovie,
    deleteMovie
} = require('../controllers/movie.controller');

// Movie management routes
router.post('/', verifyToken, isAdmin, addMovie);
router.get('/', getAllMovies); // Public route
router.delete('/:id', verifyToken, isAdmin, deleteMovie);

module.exports = router; 