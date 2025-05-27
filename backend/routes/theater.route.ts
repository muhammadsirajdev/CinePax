import express, { RequestHandler } from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.middleware';
import {
    addTheater,
    getAllTheaters,
    deleteTheater
} from '../controllers/theater.controller';

const router = express.Router();

// Theater management routes
router.post('/', verifyToken, isAdmin, addTheater as RequestHandler);
router.get('/', getAllTheaters); // Public route
router.delete('/:id', verifyToken, isAdmin, deleteTheater as unknown as RequestHandler);

export default router; 