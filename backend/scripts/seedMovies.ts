import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Movie from '../model/movie.model';
import fs from 'fs';
import path from 'path';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Cinepax';

// Read movies from the frontend JSON file
const moviesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../frontend/src/movies.json'), 'utf-8'));

// Helper function to safely parse MongoDB date
const parseMongoDate = (dateObj: any): Date => {
  try {
    if (dateObj?.$date?.$numberLong) {
      return new Date(parseInt(dateObj.$date.$numberLong));
    }
    // Fallback to using the year if date parsing fails
    return new Date(dateObj?.year || new Date().getFullYear(), 0, 1);
  } catch (error) {
    console.warn('Error parsing date, using year as fallback:', error);
    return new Date(dateObj?.year || new Date().getFullYear(), 0, 1);
  }
};

// Transform the data to match our model
const movies = moviesData.map((movie: any) => ({
  title: movie.title || 'Untitled Movie',
  duration: movie.duration || 120, // Default 2 hours
  genre: movie.genre || 'Unknown',
  releaseDate: parseMongoDate(movie.releaseDate),
  image: movie.image || 'https://picsum.photos/800/1200', // Default placeholder image
  description: movie.description || `A ${movie.genre || 'movie'} from ${movie.year || 'unknown year'}.`, // Generate description if missing
  rating: movie.rating || 0,
  year: movie.year || new Date().getFullYear(),
  director: movie.director || "Unknown",
  cast: movie.cast || ["Unknown"]
}));

async function seedMovies() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing movies
    await Movie.deleteMany({});
    console.log('Cleared existing movies');

    // Insert new movies
    await Movie.insertMany(movies);
    console.log(`Successfully added ${movies.length} movies`);

  } catch (error) {
    console.error('Error seeding movies:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedMovies(); 