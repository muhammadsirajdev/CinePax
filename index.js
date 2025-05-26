const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const connectDB = require('./connect');

// Import routes
const authRoutes = require('./routes/auth.route');
const customerRoutes = require('./routes/customer.route');
const movieRoutes = require('./routes/movie.route');
const theaterRoutes = require('./routes/theater.route');
const staffRoutes = require('./routes/staff.route');
const seatRoutes = require('./routes/seat.route');
const showtimeRoutes = require('./routes/showtime.route');
const ticketRoutes = require('./routes/ticket.route');
const paymentRoutes = require('./routes/payment.route');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

app.use((req, res, next) => {
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

app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// MongoDB connection
connectDB(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
