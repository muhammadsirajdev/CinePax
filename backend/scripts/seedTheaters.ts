import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Theater from '../model/theater.model';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Cinepax';

const theaters = [
  {
    name: "CinePax IMAX",
    location: "Downtown Mall, 123 Main St",
    capacity: 300,
    amenities: ["IMAX", "Dolby Atmos", "Premium Seating"],
    screens: 5
  },
  {
    name: "CinePax Premium",
    location: "Westside Plaza, 456 Oak Ave",
    capacity: 250,
    amenities: ["Dolby Atmos", "Premium Seating", "Food Service"],
    screens: 4
  },
  {
    name: "CinePax Express",
    location: "Eastside Center, 789 Pine Rd",
    capacity: 200,
    amenities: ["Standard Seating", "Snack Bar"],
    screens: 3
  },
  {
    name: "CinePax Family",
    location: "Northside Mall, 321 Elm St",
    capacity: 280,
    amenities: ["Family Seating", "Play Area", "Snack Bar"],
    screens: 4
  },
  {
    name: "CinePax VIP",
    location: "Southside Complex, 654 Maple Dr",
    capacity: 150,
    amenities: ["VIP Seating", "Lounge", "Premium Food Service"],
    screens: 3
  }
];

async function seedTheaters() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing theaters
    await Theater.deleteMany({});
    console.log('Cleared existing theaters');

    // Insert new theaters
    await Theater.insertMany(theaters);
    console.log(`Successfully added ${theaters.length} theaters`);

  } catch (error) {
    console.error('Error seeding theaters:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedTheaters(); 