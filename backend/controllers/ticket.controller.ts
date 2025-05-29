import { Request, Response } from 'express';
import Ticket from '../model/ticket.model';
import Showtime from '../model/showtime.model';
import Theater from '../model/theater.model';
import { Document, Types } from 'mongoose';

interface PopulatedMovie {
  _id: Types.ObjectId;
  title: string;
  duration: string;
  genre: string;
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
  customer: {
    _id: Types.ObjectId;
    fullName: string;
    email: string;
    phone: string;
  };
  seat: {
    seatNumber: string;
    row: string;
  };
  price: number;
  status: string;
  createdAt: Date;
}

interface TheaterStats {
  theater: PopulatedTheater;
  totalSeats: number;
  bookedSeats: number;
  availableSeats: number;
}

// Get all booked tickets (admin only)
export const getAllBookedTickets = async (req: Request, res: Response) => {
  try {
    const tickets = (await Ticket.find()
      .populate({
        path: 'showtime',
        populate: [
          { path: 'movieId', select: 'title duration genre' },
          { path: 'theaterId', select: 'name location capacity' }
        ]
      })
      .populate('customer', 'fullName email phone')
      .populate('seat', 'seatNumber row')
      .lean()) as unknown as PopulatedTicket[];

    // Calculate available seats for each theater
    const theaterStats: Record<string, TheaterStats> = {};
    tickets.forEach(ticket => {
      const showtime = ticket.showtime;
      if (showtime && showtime.theaterId) {
        const theaterId = showtime.theaterId._id.toString();
        if (!theaterStats[theaterId]) {
          theaterStats[theaterId] = {
            theater: showtime.theaterId,
            totalSeats: showtime.theaterId.capacity,
            bookedSeats: 0,
            availableSeats: showtime.theaterId.capacity
          };
        }
        theaterStats[theaterId].bookedSeats++;
        theaterStats[theaterId].availableSeats--;
      }
    });

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets.map(ticket => ({
        _id: ticket._id,
        customer: ticket.customer,
        showtime: {
          _id: ticket.showtime._id,
          movie: ticket.showtime.movieId,
          theater: ticket.showtime.theaterId,
          startTime: ticket.showtime.startTime,
          endTime: ticket.showtime.endTime,
          price: ticket.showtime.price
        },
        seat: ticket.seat,
        price: ticket.price,
        status: ticket.status,
        createdAt: ticket.createdAt
      })),
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
    const theater = await Theater.findById(showtime.theaterId);
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
        movie: showtime.movieId,
        theater: showtime.theaterId,
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

// Update ticket status (admin only)
export const updateTicketStatus = async (req: Request<{ ticketId: string }>, res: Response) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const ticket = await Ticket.findById(ticketId)
      .populate({
        path: 'showtime',
        populate: [
          { path: 'movie', select: 'title duration genre' },
          { path: 'theater', select: 'name location capacity' }
        ]
      })
      .populate('customer', 'fullName email phone')
      .populate('seat', 'seatNumber row');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if showtime is in the past
    const showtime = await Showtime.findById(ticket.showtime);
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    const showtimeDate = new Date(showtime.startTime);
    const currentDate = new Date();

    // Don't allow status changes for past showtimes
    if (showtimeDate < currentDate) {
      return res.status(400).json({ message: 'Cannot update status for past showtimes' });
    }

    // Update ticket status
    ticket.status = status;
    await ticket.save();

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export default {
  getAllBookedTickets,
  getBookedTicketsByShowtime,
  updateTicketStatus
}; 