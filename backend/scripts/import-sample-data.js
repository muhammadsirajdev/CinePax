const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const Theater = require('../model/theater.model');
const Showtime = require('../model/showtime.model');
const Seat = require('../model/seat.model');
const Booking = require('../model/booking.model');

// Read sample data
const sampleData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/sample-data.json'), 'utf8')
);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Import data
async function importData() {
  try {
    // Clear existing data
    await Promise.all([
      Theater.deleteMany({}),
      Showtime.deleteMany({}),
      Seat.deleteMany({}),
      Booking.deleteMany({})
    ]);

    // Import theaters
    const theaters = await Theater.insertMany(sampleData.theaters);
    console.log('Theaters imported:', theaters.length);

    // Import showtimes
    const showtimes = await Showtime.insertMany(sampleData.showtimes);
    console.log('Showtimes imported:', showtimes.length);

    // Import seats
    const seats = await Seat.insertMany(sampleData.seats);
    console.log('Seats imported:', seats.length);

    // Import bookings
    const bookings = await Booking.insertMany(sampleData.bookings);
    console.log('Bookings imported:', bookings.length);

    console.log('Sample data imported successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
}

importData(); 