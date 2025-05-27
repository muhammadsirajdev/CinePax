import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import connectDB from './connect';

// Import routes
import authRoutes from './routes/auth.route';
import customerRoutes from './routes/customer.route';
import movieRoutes from './routes/movie.route';
import theaterRoutes from './routes/theater.route';
import staffRoutes from './routes/staff.route';
import seatRoutes from './routes/seat.route';
import showtimeRoutes from './routes/showtime.route';
import ticketRoutes from './routes/ticket.route';
import paymentRoutes from './routes/payment.route';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`Incoming ${req.method} request to ${req.url}`);
  next();
});

// Routes
app.use('/', authRoutes);
app.use('/user', customerRoutes);
app.use('/movies', movieRoutes);
app.use('/theaters', theaterRoutes);
app.use('/staff', staffRoutes);
app.use('/seats', seatRoutes);
app.use('/showtimes', showtimeRoutes);
app.use('/tickets', ticketRoutes);
app.use('/payments', paymentRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Backend server is running!');
});

connectDB(process.env.MONGO_URI || '')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
}); 