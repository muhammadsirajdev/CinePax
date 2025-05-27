import express, { RequestHandler } from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.middleware';
import {
    getAllBookedTickets,
    getBookedTicketsByShowtime
} from '../controllers/ticket.controller';

const router = express.Router();

// Ticket management routes (admin only)
router.get('/', verifyToken, isAdmin, getAllBookedTickets);
router.get('/showtime/:showtimeId', verifyToken, isAdmin, getBookedTicketsByShowtime as unknown as RequestHandler);

export default router; 