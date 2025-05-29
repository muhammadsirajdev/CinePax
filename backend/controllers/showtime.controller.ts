import { Request, Response } from 'express';
import Showtime from '../model/showtime.model';
import Movie from '../model/movie.model';
import Theater from '../model/theater.model';

interface ShowtimeRequest {
  movieId: string;
  theaterId: string;
  startTime: string;
  endTime: string;
  price: number;
}

// Add new showtime
export const addShowtime = async (req: Request<{}, {}, ShowtimeRequest>, res: Response) => {
  try {
    const { movieId, theaterId, startTime, endTime, price } = req.body;

    if (!movieId || !theaterId || !startTime || !endTime || !price) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate price
    if (price < 0) {
      return res.status(400).json({ message: 'Price cannot be negative' });
    }

    // Check if movie exists
    const movieExists = await Movie.findById(movieId);
    if (!movieExists) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Check if theater exists
    const theaterExists = await Theater.findById(theaterId);
    if (!theaterExists) {
      return res.status(404).json({ message: 'Theater not found' });
    }

    // Convert string dates to Date objects
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);

    // Validate dates
    if (startDateTime >= endDateTime) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    // Check for overlapping showtimes in the same theater
    const overlappingShowtime = await Showtime.findOne({
      theaterId,
      $or: [
        {
          startTime: { $lt: endDateTime },
          endTime: { $gt: startDateTime }
        }
      ]
    });

    if (overlappingShowtime) {
      return res.status(400).json({ 
        message: 'Showtime overlaps with existing showtime in this theater',
        existingShowtime: overlappingShowtime
      });
    }

    const showtime = await Showtime.create({
      movieId,
      theaterId,
      startTime: startDateTime,
      endTime: endDateTime,
      price,
      availableSeats: theaterExists.capacity // Set initial available seats to theater capacity
    });

    res.status(201).json({
      success: true,
      data: showtime
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all showtimes
export const getAllShowtimes = async (req: Request, res: Response) => {
  try {
    const showtimes = await Showtime.find()
      .populate('movieId', 'title duration genre')
      .populate('theaterId', 'name location');
    
    // Format the response to include pricing information
    const formattedShowtimes = showtimes.map(showtime => ({
      ...showtime.toObject(),
      ticketPrice: showtime.price
    }));

    res.status(200).json({
      success: true,
      count: showtimes.length,
      data: formattedShowtimes
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete showtime
export const deleteShowtime = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const showtime = await Showtime.findById(id);
    
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    await Showtime.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: 'Showtime deleted successfully'
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 