const Seat = require('../model/seat.model');
const Theater = require('../model/theater.model');

// Add new seat
const addSeat = async (req, res) => {
  try {
    const { theater, seatNumber, row } = req.body;

    if (!theater || !seatNumber || !row) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if theater exists and get current seat count
    const theaterExists = await Theater.findById(theater);
    if (!theaterExists) {
      return res.status(404).json({ message: 'Theater not found' });
    }

    // Get current seat count for the theater
    const currentSeatCount = await Seat.countDocuments({ theater: theater });
    
    // Check if adding new seat would exceed theater capacity
    if (currentSeatCount >= theaterExists.capacity) {
      return res.status(400).json({ 
        message: 'Cannot add more seats. Theater has reached maximum capacity',
        currentCapacity: currentSeatCount,
        maxCapacity: theaterExists.capacity
      });
    }

    // Check if seat already exists in the theater
    const existingSeat = await Seat.findOne({
      theater,
      seatNumber,
      row
    });

    if (existingSeat) {
      return res.status(400).json({ message: 'Seat already exists in this theater' });
    }

    const seat = await Seat.create({
      theater,
      seatNumber,
      row,
      isAvailable: true
    });

    res.status(201).json({
      success: true,
      data: seat,
      remainingCapacity: theaterExists.capacity - (currentSeatCount + 1)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all seats
const getAllSeats = async (req, res) => {
  try {
    const seats = await Seat.find().populate('theater', 'name location capacity');
    
    // Calculate remaining capacity for each theater
    const theaterSeats = {};
    seats.forEach(seat => {
      if (!theaterSeats[seat.theater._id]) {
        theaterSeats[seat.theater._id] = {
          theater: seat.theater,
          totalSeats: 0,
          remainingCapacity: seat.theater.capacity
        };
      }
      theaterSeats[seat.theater._id].totalSeats++;
      theaterSeats[seat.theater._id].remainingCapacity--;
    });

    res.status(200).json({
      success: true,
      count: seats.length,
      data: seats,
      theaterCapacity: Object.values(theaterSeats)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete seat
const deleteSeat = async (req, res) => {
  try {
    const { id } = req.params;
    const seat = await Seat.findById(id);
    
    if (!seat) {
      return res.status(404).json({ message: 'Seat not found' });
    }

    // Get theater details before deleting seat
    const theater = await Theater.findById(seat.theater);
    const currentSeatCount = await Seat.countDocuments({ theater: seat.theater });

    // Delete the seat
    await Seat.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Seat deleted successfully',
      remainingCapacity: theater.capacity - (currentSeatCount - 1)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  addSeat,
  getAllSeats,
  deleteSeat
}; 