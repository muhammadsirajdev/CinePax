import express, { RequestHandler } from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.middleware';
import {
  addMovie,
  getAllMovies,
  deleteMovie,
  getMovieById,
  getTheaterShowtimes,
  getFeaturedMovies,
  updateMovie
} from '../controllers/movie.controller';

const router = express.Router();

// Movie management routes
router.post('/', verifyToken, isAdmin, addMovie as RequestHandler);
router.put('/:id', verifyToken, isAdmin, updateMovie as unknown as RequestHandler);
router.get('/', getAllMovies as RequestHandler); // Public route
router.get('/featured', getFeaturedMovies as RequestHandler);
router.delete('/:id', verifyToken, isAdmin, deleteMovie as unknown as RequestHandler);

// Get movie by ID
router.get('/:id', getMovieById as RequestHandler);

// Get theater showtimes
router.get('/theater/:theaterId/showtimes', verifyToken, getTheaterShowtimes as RequestHandler);

export default router; 