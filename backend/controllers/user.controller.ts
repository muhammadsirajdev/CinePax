import { Request, Response } from 'express';
import Movie, { IMovie } from '../model/movie.model';
import Showtime, { IShowtime } from '../model/showtime.model';
import Theater, { ITheater } from '../model/theater.model';
import Ticket, { ITicket } from '../model/ticket.model';
import Booking, { IBooking } from '../model/booking.model';
import Payment from '../model/payment.model';
import { Document, Types } from 'mongoose';
import Seat from '../model/seat.model';
import mongoose from 'mongoose';

interface PopulatedMovie {
  _id: Types.ObjectId;
  title: string;
  description: string;
  duration: string;
  genre: string;
  releaseDate: Date;
  posterUrl: string;
}

interface PopulatedTheater {
  _id: Types.ObjectId;
  name: string;
  location: string;
  capacity: number;
}

interface PopulatedShowtime {
  _id: Types.ObjectId;
  movieId: PopulatedMovie;
  theaterId: PopulatedTheater;
  startTime: Date;
  endTime: Date;
  price: number;
}

interface PopulatedTicket {
  _id: Types.ObjectId;
  showtime: PopulatedShowtime;
  seat: {
    seatNumber: string;
    row: string;
  };
  price: number;
  status: string;
  purchaseDate: Date;
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
      .populate<{ movieId: PopulatedMovie }>('movieId', 'title description duration genre releaseDate posterUrl')
      .populate<{ theaterId: PopulatedTheater }>('theaterId', 'name location capacity')
      .lean();

    // Group showtimes by movie
    const moviesWithShowtimes = movies.map(movie => {
      const movieShowtimes = showtimes.filter(showtime => 
        showtime.movieId._id.toString() === movie._id.toString()
      );

      return {
        ...movie,
        showtimes: movieShowtimes.map(showtime => ({
          id: showtime._id,
          theater: showtime.theaterId,
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

    const showtimes = await Showtime.find({ movieId })
      .populate<{ theaterId: PopulatedTheater }>('theaterId', 'name location capacity')
      .lean();

    // Get seat availability for each showtime
    const showtimesWithAvailability = await Promise.all(showtimes.map(async (showtime) => {
      const bookedTickets = await Ticket.find({ showtime: showtime._id });
      const bookedSeats = bookedTickets.map(ticket => ticket.seat);
      const availableSeats = showtime.theaterId.capacity - bookedSeats.length;

      return {
        id: showtime._id,
        theater: showtime.theaterId,
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
      .populate<{ movieId: PopulatedMovie }>('movieId', 'title description duration genre releaseDate posterUrl')
      .populate<{ theaterId: PopulatedTheater }>('theaterId', 'name location capacity')
      .lean();

    if (!showtime) {
      res.status(404).json({ message: 'Showtime not found' });
      return;
    }

    const bookedTickets = await Ticket.find({ showtime: showtimeId });
    const bookedSeats = bookedTickets.map(ticket => ticket.seat);
    const availableSeats = showtime.theaterId.capacity - bookedSeats.length;

    res.status(200).json({
      success: true,
      data: {
        ...showtime,
        availableSeats,
        bookedSeats: bookedSeats.length,
        seatAvailability: {
          total: showtime.theaterId.capacity,
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
export const bookTicket = async (req: Request, res: Response) => {
  try {
    const { showtimeId, seatNumber, row } = req.body;
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get showtime
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    // Try to acquire pessimistic lock on the seat
    // const lockedSeat = await Seat.acquireLock(
    //   new mongoose.Types.ObjectId(showtimeId),
    //   seatNumber,
    //   row,
    //   new mongoose.Types.ObjectId(customerId)
    // );

    // if (!lockedSeat) {
    //   return res.status(409).json({ message: "Seat is currently being booked by another user" });
    // }

    try {
      // Check if seat is already booked
      const existingTicket = await Ticket.findOne({
        showtime: showtimeId,
        'seat.seatNumber': seatNumber,
        'seat.row': row,
        status: { $ne: 'CANCELLED' }
      });

      if (existingTicket) {
        return res.status(400).json({ message: "Seat is already booked" });
      }

      // Create seat document
      const seat = await Seat.create([{
        showtimeId,
        seatNumber,
        row,
        status: 'BOOKED',
        version: 0
      }]);

      // Create ticket
      const ticket = await Ticket.create([{
        showtime: showtimeId,
        customer: customerId,
        seat: seat[0]._id,
        price: showtime.price,
        status: 'confirmed'
      }]);

      if (!ticket || !ticket[0]) {
        throw new Error('Failed to create ticket');
      }

      // Create payment
      const payment = await Payment.create([{
        ticket: ticket[0]._id,
        amount: showtime.price,
        paymentMethod: 'ONLINE',
        paymentStatus: 'COMPLETED'
      }]);

      if (!payment || !payment[0]) {
        throw new Error('Failed to create payment');
      }

      // Create booking record
      const booking = await Booking.create([{
        userId: customerId,
        showtimeId,
        seats: [`${row}${seatNumber}`],
        totalAmount: showtime.price,
        status: 'confirmed',
        paymentStatus: 'paid',
        ticket: ticket[0]._id,
        payment: payment[0]._id
      }]);

      if (!booking || !booking[0]) {
        throw new Error('Failed to create booking');
      }

      // Update showtime's available seats
      showtime.availableSeats -= 1;
      await showtime.save();

      // Release the pessimistic lock
      // await Seat.releaseLock(
      //   new mongoose.Types.ObjectId(showtimeId),
      //   seatNumber,
      //   row,
      //   new mongoose.Types.ObjectId(customerId)
      // );

      // Return success response
      return res.status(201).json({
        success: true,
        message: "Ticket booked successfully",
        data: {
          ticket: {
            _id: ticket[0]._id,
            showtime: showtimeId,
            customer: customerId,
            seat: {
              seatNumber,
              row
            },
            price: showtime.price,
            status: 'confirmed',
            purchaseDate: new Date()
          },
          payment: {
            _id: payment[0]._id,
            ticket: ticket[0]._id,
            amount: showtime.price,
            paymentMethod: 'ONLINE',
            paymentStatus: 'COMPLETED',
            paymentDate: new Date()
          },
          booking: {
            _id: booking[0]._id,
            userId: customerId,
            showtimeId,
            seats: [`${row}${seatNumber}`],
            totalAmount: showtime.price,
            status: 'confirmed',
            paymentStatus: 'paid'
          }
        }
      });

    } catch (error) {
      // Release the pessimistic lock in case of error
      // await Seat.releaseLock(
      //   new mongoose.Types.ObjectId(showtimeId),
      //   seatNumber,
      //   row,
      //   new mongoose.Types.ObjectId(customerId)
      // );
      throw error;
    }

  } catch (error: any) {
    console.error("Booking error:", error);
    return res.status(500).json({ message: error.message || "Error booking ticket" });
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

    const tickets = (await Ticket.find({ customer: customerId })
      .populate({
        path: 'showtime',
        populate: [
          { path: 'movieId', select: 'title duration genre posterUrl' },
          { path: 'theaterId', select: 'name location' }
        ]
      })
      .populate('seat', 'seatNumber row')
      .lean()) as unknown as PopulatedTicket[];

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets.map(ticket => ({
        ticketId: ticket._id,
        movie: ticket.showtime.movieId,
        theater: ticket.showtime.theaterId,
        showtime: {
          startTime: ticket.showtime.startTime,
          endTime: ticket.showtime.endTime
        },
        seat: ticket.seat,
        price: ticket.price,
        status: ticket.status,
        bookingDate: ticket.purchaseDate
      }))
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
      .populate<{ movieId: PopulatedMovie }>('movieId', 'title duration genre posterUrl')
      .populate<{ theaterId: PopulatedTheater }>('theaterId', 'name location')
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
    console.log("Customer ID from token:", customerId);
    if (!customerId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const bookings = await Booking.find({ userId: new Types.ObjectId(customerId) })
      .populate<{ showtimeId: PopulatedShowtime }>({
        path: 'showtimeId',
        populate: [
          { path: 'movieId', select: 'title duration genre posterUrl' },
          { path: 'theaterId', select: 'name location' }
        ]
      })
      .populate('seats')
      .sort({ createdAt: -1 })
      .lean();

    console.log("Found bookings:", bookings.length);

    const bookingHistory = bookings.map(booking => {
      // Provide default values for missing data
      const defaultMovie = {
        _id: new Types.ObjectId(),
        title: 'Movie Information Unavailable',
        duration: 'N/A',
        genre: 'N/A',
        posterUrl: '/placeholder-movie.jpg'
      };

      const defaultTheater = {
        _id: new Types.ObjectId(),
        name: 'Theater Information Unavailable',
        location: 'N/A'
      };

      const defaultShowtime = {
        startTime: booking.createdAt || new Date(),
        endTime: new Date(booking.createdAt?.getTime() + 7200000) || new Date() // 2 hours after start
      };

      // Parse seat strings into row and seatNumber
      const parsedSeats = booking.seats?.map(seatStr => {
        const row = seatStr.charAt(0);
        const seatNumber = seatStr.slice(1);
        return {
          row,
          seatNumber
        };
      }) || [{
        row: 'N/A',
        seatNumber: 'N/A'
      }];

      return {
        bookingId: booking._id,
        movie: booking.showtimeId?.movieId || defaultMovie,
        theater: booking.showtimeId?.theaterId || defaultTheater,
        showtime: {
          startTime: booking.showtimeId?.startTime || defaultShowtime.startTime,
          endTime: booking.showtimeId?.endTime || defaultShowtime.endTime
        },
        seats: parsedSeats,
        totalAmount: booking.totalAmount || 0,
        price: booking.showtimeId?.price || 0,
        bookingDate: booking.createdAt || new Date(),
        status: booking.status || 'UNKNOWN',
        paymentStatus: booking.paymentStatus || 'UNKNOWN'
      };
    });

    res.status(200).json({
      success: true,
      count: bookingHistory.length,
      data: bookingHistory
    });
  } catch (err: any) {
    console.error("Error in getBookingHistory:", err);
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