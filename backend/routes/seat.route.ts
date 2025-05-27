import express, { RequestHandler } from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.middleware';
import {
    addSeat,
    getAllSeats,
    deleteSeat
} from '../controllers/seat.controller';

const router = express.Router();

// Seat management routes
router.post('/', verifyToken, isAdmin, addSeat as RequestHandler);
router.get('/', getAllSeats); // Public route
router.delete('/:id', verifyToken, isAdmin, deleteSeat as RequestHandler);

export default router; 