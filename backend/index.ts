import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

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
import userRoutes from './routes/user.route';
import adminRoutes from './routes/admin.route';

dotenv.config();

// Connect to MongoDB
connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/cinepax');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "*", // Frontend URL
  credentials: true
}));
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`Incoming ${req.method} request to ${req.url}`);
  next();
});

// Routes
app.use('/api', authRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/user', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/theaters', theaterRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Backend server is running!');
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
}); 