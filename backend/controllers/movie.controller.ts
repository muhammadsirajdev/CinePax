import { Request, Response } from 'express';
import Movie from '../model/movie.model';

interface MovieRequest {
  title: string;
  duration: number;
  genre: string;
  releaseDate: Date;
}

// Add new movie
export const addMovie = async (req: Request<{}, {}, MovieRequest>, res: Response) => {
  try {
    const { title, duration, genre, releaseDate } = req.body;

    if (!title || !duration || !genre || !releaseDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const movie = await Movie.create({
      title,
      duration,
      genre,
      releaseDate
    });

    res.status(201).json({
      success: true,
      data: movie
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all movies
export const getAllMovies = async (req: Request, res: Response) => {
  try {
    const movies = await Movie.find();
    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete movie
export const deleteMovie = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findById(id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    await Movie.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: 'Movie deleted successfully'
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 