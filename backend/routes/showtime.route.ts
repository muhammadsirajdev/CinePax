import express, { RequestHandler } from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.middleware';
import {
    addShowtime,
    getAllShowtimes,
    deleteShowtime
} from '../controllers/showtime.controller';

const router = express.Router();

// Showtime management routes
router.post('/', verifyToken, isAdmin, addShowtime as RequestHandler);
router.get('/', getAllShowtimes); // Public route
router.delete('/:id', verifyToken, isAdmin, deleteShowtime as unknown as RequestHandler);

export default router; 