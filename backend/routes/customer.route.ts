import express, { RequestHandler } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { getProfile } from '../controllers/customer.controller';

const router = express.Router();

router.get('/profile', verifyToken, getProfile as RequestHandler);

// Add other protected customer routes here

export default router; 