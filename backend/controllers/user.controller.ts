import { Request, Response } from 'express';
import Movie, { IMovie } from '../model/movie.model';
import Showtime, { IShowtime } from '../model/showtime.model';
import Theater, { ITheater } from '../model/theater.model';
import Ticket, { ITicket } from '../model/ticket.model';
import Payment from '../model/payment.model';
import { Document, Types } from 'mongoose';

interface PopulatedMovie extends IMovie {
  _id: Types.ObjectId;
}

interface PopulatedTheater extends ITheater {
  _id: Types.ObjectId;
}

interface PopulatedShowtime extends IShowtime {
  _id: Types.ObjectId;
  movie: PopulatedMovie;
  theater: PopulatedTheater;
}

interface BookingRequest {
  showtimeId: string;
  seatNumber: string;
  row: string;
}

interface SearchQuery {
  title?: string;
  genre?: string;
  startDate?: string;
  endDate?: string;
  time?: string;
}

// Get all movies with their showtimes
export const getAllMoviesWithShowtimes = async (req: Request, res: Response): Promise<void> => {
  try {
    const movies = await Movie.find().lean();
    const showtimes = await Showtime.find()
      .populate<{ movie: PopulatedMovie }>('movie', 'title description duration genre releaseDate posterUrl')
      .populate<{ theater: PopulatedTheater }>('theater', 'name location capacity')
      .lean();

    // Group showtimes by movie
    const moviesWithShowtimes = movies.map(movie => {
      const movieShowtimes = showtimes.filter(showtime => 
        showtime.movie._id.toString() === movie._id.toString()
      );

      return {
        ...movie,
        showtimes: movieShowtimes.map(showtime => ({
          id: showtime._id,
          theater: showtime.theater,
          startTime: showtime.startTime,
          endTime: showtime.endTime,
          price: showtime.price
        }))
      };
    });

    res.status(200).json({
      success: true,
      count: moviesWithShowtimes.length,
      data: moviesWithShowtimes
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get movie details with available showtimes and seat availability
export const getMovieDetails = async (req: Request<{ movieId: string }>, res: Response): Promise<void> => {
  try {
    const { movieId } = req.params;

    const movie = await Movie.findById(movieId).lean();
    if (!movie) {
      res.status(404).json({ message: 'Movie not found' });
      return;
    }

    const showtimes = await Showtime.find({ movie: movieId })
      .populate<{ theater: PopulatedTheater }>('theater', 'name location capacity')
      .lean();

    // Get seat availability for each showtime
    const showtimesWithAvailability = await Promise.all(showtimes.map(async (showtime) => {
      const bookedTickets = await Ticket.find({ showtime: showtime._id });
      const bookedSeats = bookedTickets.map(ticket => ticket.seat);
      const availableSeats = showtime.theater.capacity - bookedSeats.length;

      return {
        id: showtime._id,
        theater: showtime.theater,
        startTime: showtime.startTime,
        endTime: showtime.endTime,
        price: showtime.price,
        availableSeats,
        bookedSeats: bookedSeats.length
      };
    }));

    res.status(200).json({
      success: true,
      data: {
        ...movie,
        showtimes: showtimesWithAvailability
      }
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get showtime details with seat availability
export const getShowtimeDetails = async (req: Request<{ showtimeId: string }>, res: Response): Promise<void> => {
  try {
    const { showtimeId } = req.params;

    const showtime = await Showtime.findById(showtimeId)
      .populate<{ movie: PopulatedMovie }>('movie', 'title description duration genre releaseDate posterUrl')
      .populate<{ theater: PopulatedTheater }>('theater', 'name location capacity')
      .lean();

    if (!showtime) {
      res.status(404).json({ message: 'Showtime not found' });
      return;
    }

    const bookedTickets = await Ticket.find({ showtime: showtimeId });
    const bookedSeats = bookedTickets.map(ticket => ticket.seat);
    const availableSeats = showtime.theater.capacity - bookedSeats.length;

    res.status(200).json({
      success: true,
      data: {
        ...showtime,
        availableSeats,
        bookedSeats: bookedSeats.length,
        seatAvailability: {
          total: showtime.theater.capacity,
          available: availableSeats,
          booked: bookedSeats.length
        }
      }
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Book a ticket
export const bookTicket = async (req: Request<{}, {}, BookingRequest>, res: Response): Promise<void> => {
  try {
    const { showtimeId, seatNumber, row } = req.body;
    const customerId = req.user?.id;

    if (!customerId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Check if showtime exists
    const showtime = await Showtime.findById(showtimeId)
      .populate<{ theater: PopulatedTheater }>('theater', 'capacity')
      .lean();
    
    if (!showtime) {
      res.status(404).json({ message: 'Showtime not found' });
      return;
    }

    // Check if seat is already booked
    const existingTicket = await Ticket.findOne({
      showtime: showtimeId,
      seat: { seatNumber, row }
    });

    if (existingTicket) {
      res.status(400).json({ message: 'Seat is already booked' });
      return;
    }

    // Create ticket
    const ticket = await Ticket.create({
      showtime: showtimeId,
      customer: customerId,
      seat: { seatNumber, row },
      price: showtime.price
    });

    // Create payment (hypothetical for now)
    const payment = await Payment.create({
      ticket: ticket._id,
      amount: showtime.price,
      paymentMethod: 'ONLINE',
      paymentStatus: 'COMPLETED'
    });

    res.status(201).json({
      success: true,
      data: {
        ticket,
        payment
      }
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get user's booked tickets
export const getUserTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const tickets = await Ticket.find({ customer: customerId })
      .populate<{ showtime: PopulatedShowtime }>({
        path: 'showtime',
        populate: [
          { path: 'movie', select: 'title duration genre posterUrl' },
          { path: 'theater', select: 'name location' }
        ]
      })
      .populate('seat', 'seatNumber row')
      .lean();

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Search movies by title/genre
export const searchMovies = async (req: Request<{}, {}, {}, SearchQuery>, res: Response): Promise<void> => {
  try {
    const { title, genre } = req.query;
    const query: any = {};

    if (title) {
      query.title = { $regex: title, $options: 'i' };
    }
    if (genre) {
      query.genre = { $regex: genre, $options: 'i' };
    }

    const movies = await Movie.find(query).lean();
    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Filter showtimes by date/time
export const filterShowtimes = async (req: Request<{}, {}, {}, SearchQuery>, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, time } = req.query;
    const query: any = {};

    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) {
        query.startTime.$gte = new Date(startDate);
      }
      if (endDate) {
        query.startTime.$lte = new Date(endDate);
      }
    }

    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      const timeDate = new Date();
      timeDate.setHours(hours, minutes, 0, 0);
      query.startTime = { ...query.startTime, $gte: timeDate };
    }

    const showtimes = await Showtime.find(query)
      .populate<{ movie: PopulatedMovie }>('movie', 'title duration genre posterUrl')
      .populate<{ theater: PopulatedTheater }>('theater', 'name location')
      .lean();

    res.status(200).json({
      success: true,
      count: showtimes.length,
      data: showtimes
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get detailed booking history
export const getBookingHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;
    if (!customerId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const tickets = await Ticket.find({ customer: customerId })
      .populate<{ showtime: PopulatedShowtime }>({
        path: 'showtime',
        populate: [
          { path: 'movie', select: 'title duration genre posterUrl' },
          { path: 'theater', select: 'name location' }
        ]
      })
      .populate('seat', 'seatNumber row')
      .sort({ createdAt: -1 })
      .lean();

    const bookingHistory = tickets.map(ticket => ({
      ticketId: ticket._id,
      movie: ticket.showtime.movie,
      theater: ticket.showtime.theater,
      showtime: {
        startTime: ticket.showtime.startTime,
        endTime: ticket.showtime.endTime
      },
      seat: ticket.seat,
      price: ticket.price,
      bookingDate: ticket.createdAt,
      status: 'confirmed' // You can add more statuses like 'cancelled', 'refunded', etc.
    }));

    res.status(200).json({
      success: true,
      count: bookingHistory.length,
      data: bookingHistory
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Cancel booking
export const cancelBooking = async (req: Request<{ ticketId: string }>, res: Response): Promise<void> => {
  try {
    const { ticketId } = req.params;
    const customerId = req.user?.id;

    if (!customerId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const ticket = await Ticket.findOne({ _id: ticketId, customer: customerId });
    if (!ticket) {
      res.status(404).json({ message: 'Ticket not found' });
      return;
    }

    // Check if showtime is in the future
    const showtime = await Showtime.findById(ticket.showtime);
    if (!showtime) {
      res.status(404).json({ message: 'Showtime not found' });
      return;
    }

    const showtimeDate = new Date(showtime.startTime);
    const currentDate = new Date();
    const hoursUntilShowtime = (showtimeDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60);

    // Only allow cancellation if showtime is more than 2 hours away
    if (hoursUntilShowtime <= 2) {
      res.status(400).json({ message: 'Cannot cancel booking less than 2 hours before showtime' });
      return;
    }

    // Delete the ticket
    await Ticket.findByIdAndDelete(ticketId);

    // Update payment status if exists
    await Payment.findOneAndUpdate(
      { ticket: ticketId },
      { paymentStatus: 'REFUNDED' }
    );

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 