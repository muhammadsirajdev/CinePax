import express, { RequestHandler } from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.middleware';
import {
  addMovie,
  getAllMovies,
  deleteMovie
} from '../controllers/movie.controller';

const router = express.Router();

// Movie management routes
router.post('/', verifyToken, isAdmin, addMovie as RequestHandler);
router.get('/', getAllMovies as RequestHandler); // Public route
router.delete('/:id', verifyToken, isAdmin, deleteMovie as unknown as RequestHandler);

export default router; 