import { Request, Response } from 'express';
import Movie from '../model/movie.model';
import Showtime from '../model/showtime.model';
import Ticket from '../model/ticket.model';
import { Types } from 'mongoose';

interface MovieRequest {
  title: string;
  duration: number;
  genre: string;
  releaseDate: Date;
  image?: string;
  description: string;
  rating: number;
  year: number;
}

interface PopulatedTheater {
  _id: Types.ObjectId;
  name: string;
  location: string;
  capacity: number;
}

// Add new movie
export const addMovie = async (req: Request<{}, {}, MovieRequest>, res: Response) => {
  try {
    const { title, duration, genre, releaseDate, image, description, rating, year } = req.body;

    if (!title || !duration || !genre || !releaseDate || !description || !year) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const movie = await Movie.create({
      title,
      duration,
      genre,
      releaseDate,
      image: image || `https://picsum.photos/800/1200?random=${Date.now()}`,
      description,
      rating: rating || 0,
      year
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
    const movies = await Movie.find().sort({ releaseDate: -1 });
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

export const getMovieById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findById(id).lean();
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Fetch showtimes for this movie
    const showtimes = await Showtime.find({ movieId: id })
      .populate<{ theaterId: PopulatedTheater }>('theaterId', 'name location capacity')
      .lean();

    // Get seat availability for each showtime
    const showtimesWithAvailability = await Promise.all(showtimes.map(async (showtime) => {
      const bookedTickets = await Ticket.find({ showtime: showtime._id });
      const bookedSeats = bookedTickets.map(ticket => ticket.seat);
      const availableSeats = showtime.theaterId.capacity - bookedSeats.length;

      return {
        _id: showtime._id,
        theaterId: {
          _id: showtime.theaterId._id,
          name: showtime.theaterId.name,
          location: showtime.theaterId.location
        },
        startTime: showtime.startTime,
        endTime: showtime.endTime,
        price: showtime.price,
        availableSeats,
        bookedSeats: bookedSeats.length
      };
    }));

    res.json({
      success: true,
      data: {
        ...movie,
        showtimes: showtimesWithAvailability
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching movie', error });
  }
};

export const getTheaterShowtimes = async (req: Request, res: Response) => {
  try {
    const { theaterId } = req.params;
    const showtimes = await Showtime.find({ theaterId })
      .populate('movieId', 'title duration image')
      .sort({ startTime: 1 });
    
    res.json(showtimes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching showtimes', error });
  }
};

// Get featured movies (most recent with highest ratings)
export const getFeaturedMovies = async (req: Request, res: Response) => {
  try {
    // const movies = await Movie.find()
    //   .sort({ releaseDate: -1, rating: -1 })
    //   .limit(6);
    
    const movieIds = [
      '68372e07a568b96229dab65f',
      '68372e07a568b96229dab6a0',
      '68372e07a568b96229dab6a5',
      '68372e07a568b96229dab67e',
      '68372e07a568b96229dab69b',
      '68372e07a568b96229dab6b5'
    ];

    const movies = await Movie.find({
      _id: { $in: movieIds }
    });
    
    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update movie
export const updateMovie = async (req: Request<{ id: string }, {}, MovieRequest>, res: Response) => {
  try {
    const { id } = req.params;
    const { title, duration, genre, releaseDate, image, description, rating, year } = req.body;

    if (!title || !duration || !genre || !releaseDate || !description || !year) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const movie = await Movie.findByIdAndUpdate(
      id,
      {
        title,
        duration,
        genre,
        releaseDate,
        image: image || `https://picsum.photos/800/1200?random=${Date.now()}`,
        description,
        rating: rating || 0,
        year
      },
      { new: true }
    );

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.status(200).json({
      success: true,
      data: movie
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 