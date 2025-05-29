import { Request, Response } from 'express';
import Theater from '../model/theater.model';
import Showtime from '../model/showtime.model';
import { Document, Types } from 'mongoose';

interface TheaterRequest {
  name: string;
  location: string;
  capacity: number;
  screens?: number;
  amenities?: string[];
}

interface PopulatedMovie {
  _id: Types.ObjectId;
  title: string;
  duration: string;
  posterUrl: string;
  genre: string;
  rating: number;
}

interface PopulatedShowtime {
  _id: Types.ObjectId;
  movieId: PopulatedMovie;
  startTime: Date;
  endTime: Date;
  price: number;
  availableSeats: number;
}

// Add new theater
export const addTheater = async (req: Request<{}, {}, TheaterRequest>, res: Response) => {
  try {
    const { name, location, capacity } = req.body;

    if (!name || !location || !capacity) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const theater = await Theater.create({
      name,
      location,
      capacity
    });

    res.status(201).json({
      success: true,
      data: theater
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all theaters
export const getAllTheaters = async (req: Request, res: Response) => {
  try {
    const theaters = await Theater.find();
    res.status(200).json({
      success: true,
      count: theaters.length,
      data: theaters
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get theater by ID
export const getTheaterById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const theater = await Theater.findById(id);
    
    if (!theater) {
      return res.status(404).json({ message: 'Theater not found' });
    }

    res.status(200).json({
      success: true,
      data: theater
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get showtimes for a theater
export const getTheaterShowtimes = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const theater = await Theater.findById(id);
    
    if (!theater) {
      return res.status(404).json({ message: 'Theater not found' });
    }

    // Get total count for pagination
    const totalShowtimes = await Showtime.countDocuments({ theaterId: id });

    console.log('Fetching showtimes for theater:', id);
    console.log('Total showtimes found:', totalShowtimes);

    const showtimes = (await Showtime.find({ theaterId: id })
      .select('startTime endTime price availableSeats movieId')
      .populate('movieId', 'title duration posterUrl genre rating')
      .sort({ startTime: 1 })
      .skip(skip)
      .limit(limit)
      .lean()) as unknown as PopulatedShowtime[];

    console.log('Retrieved showtimes:', showtimes.length);

    res.status(200).json({
      success: true,
      count: showtimes.length,
      total: totalShowtimes,
      totalPages: Math.ceil(totalShowtimes / limit),
      currentPage: page,
      data: showtimes.map(showtime => ({
        _id: showtime._id,
        movie: showtime.movieId,
        startTime: showtime.startTime,
        endTime: showtime.endTime,
        price: showtime.price,
        availableSeats: showtime.availableSeats
      }))
    });
  } catch (err: any) {
    console.error('Error in getTheaterShowtimes:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete theater
export const deleteTheater = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const theater = await Theater.findById(id);
    
    if (!theater) {
      return res.status(404).json({ message: 'Theater not found' });
    }

    await Theater.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: 'Theater deleted successfully'
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update theater
export const updateTheater = async (req: Request<{ id: string }, {}, TheaterRequest>, res: Response) => {
  try {
    const { id } = req.params;
    const { name, location, capacity, screens, amenities } = req.body;

    if (!name || !location || !capacity) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const theater = await Theater.findByIdAndUpdate(
      id,
      {
        name,
        location,
        capacity,
        screens: screens || 1,
        amenities: amenities || []
      },
      { new: true }
    );

    if (!theater) {
      return res.status(404).json({ message: 'Theater not found' });
    }

    res.status(200).json({
      success: true,
      data: theater
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 