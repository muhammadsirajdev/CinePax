const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const connectDB = require('./connect');


// Import routes
const authRoutes = require('./routes/auth.route');
const customerRoutes = require('./routes/customer.route');

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
