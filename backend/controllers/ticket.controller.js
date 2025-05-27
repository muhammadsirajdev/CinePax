const Ticket = require('../model/ticket.model');
const Showtime = require('../model/showtime.model');
const Theater = require('../model/theater.model');

// Get all booked tickets (admin only)
const getAllBookedTickets = async (req, res) => {
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
    const theaterStats = {};
    tickets.forEach(ticket => {
      const theaterId = ticket.showtime.theater._id;
      if (!theaterStats[theaterId]) {
        theaterStats[theaterId] = {
          theater: ticket.showtime.theater,
          totalSeats: ticket.showtime.theater.capacity,
          bookedSeats: 0,
          availableSeats: ticket.showtime.theater.capacity
        };
      }
      theaterStats[theaterId].bookedSeats++;
      theaterStats[theaterId].availableSeats--;
    });

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
      theaterStats: Object.values(theaterStats)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get booked tickets by showtime (admin only)
const getBookedTicketsByShowtime = async (req, res) => {
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
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getAllBookedTickets,
  getBookedTicketsByShowtime
}; 