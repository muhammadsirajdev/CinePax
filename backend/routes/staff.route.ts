import express, { RequestHandler } from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.middleware';
import {
    addStaff,
    getAllStaff,
    deleteStaff
} from '../controllers/staff.controller';

const router = express.Router();

// Staff management routes
router.post('/', verifyToken, isAdmin, addStaff as RequestHandler);
router.get('/', getAllStaff as RequestHandler); // Public route
router.delete('/:id', verifyToken, isAdmin, deleteStaff as unknown as RequestHandler);

export default router; 