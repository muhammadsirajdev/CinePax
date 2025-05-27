import { Request, Response } from 'express';
import Ticket from '../model/ticket.model';
import Showtime from '../model/showtime.model';
import Theater from '../model/theater.model';

interface TheaterStats {
  theater: any;
  totalSeats: number;
  bookedSeats: number;
  availableSeats: number;
}

// Get all booked tickets (admin only)
export const getAllBookedTickets = async (req: Request, res: Response) => {
  try {
    const tickets = await Ticket.find()
      .populate({
        path: 'showtime',
        populate: [
          { path: 'movie', select: 'title duration genre' },
          { path: 'theater', select: 'name location capacity' }
        ]
      })
      .populate('customer', 'fullName email phone')
      .populate('seat', 'seatNumber row');

    // Calculate available seats for each theater
    const theaterStats: Record<string, TheaterStats> = {};
    tickets.forEach(ticket => {
      const showtime: any = ticket.showtime;
      if (showtime && typeof showtime === 'object' && showtime.theater && typeof showtime.theater === 'object' && showtime.theater._id) {
        const theaterId = showtime.theater._id.toString();
        if (!theaterStats[theaterId]) {
          theaterStats[theaterId] = {
            theater: showtime.theater,
            totalSeats: showtime.theater.capacity,
            bookedSeats: 0,
            availableSeats: showtime.theater.capacity
          };
        }
        theaterStats[theaterId].bookedSeats++;
        theaterStats[theaterId].availableSeats--;
      }
    });

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
      theaterStats: Object.values(theaterStats)
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get booked tickets by showtime (admin only)
export const getBookedTicketsByShowtime = async (req: Request<{ showtimeId: string }>, res: Response) => {
  try {
    const { showtimeId } = req.params;

    // Check if showtime exists
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    const tickets = await Ticket.find({ showtime: showtimeId })
      .populate('customer', 'fullName email phone')
      .populate('seat', 'seatNumber row');

    // Get theater capacity
    const theater = await Theater.findById(showtime.theater);
    if (!theater) {
      return res.status(404).json({ message: 'Theater not found' });
    }
    const totalSeats = theater.capacity;
    const bookedSeats = tickets.length;
    const availableSeats = totalSeats - bookedSeats;

    res.status(200).json({
      success: true,
      count: tickets.length,
      showtime: {
        movie: showtime.movie,
        theater: showtime.theater,
        startTime: showtime.startTime,
        endTime: showtime.endTime,
        price: showtime.price
      },
      seatStats: {
        totalSeats,
        bookedSeats,
        availableSeats
      },
      data: tickets
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 