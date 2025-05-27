const Showtime = require('../model/showtime.model');
const Movie = require('../model/movie.model');
const Theater = require('../model/theater.model');

// Add new showtime
const addShowtime = async (req, res) => {
  try {
    const { movie, theater, startTime, endTime, price } = req.body;

    if (!movie || !theater || !startTime || !endTime || !price) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate price
    if (price < 0) {
      return res.status(400).json({ message: 'Price cannot be negative' });
    }

    // Check if movie exists
    const movieExists = await Movie.findById(movie);
    if (!movieExists) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Check if theater exists
    const theaterExists = await Theater.findById(theater);
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
      theater,
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
      movie,
      theater,
      startTime: startDateTime,
      endTime: endDateTime,
      price
    });

    res.status(201).json({
      success: true,
      data: showtime
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all showtimes
const getAllShowtimes = async (req, res) => {
  try {
    const showtimes = await Showtime.find()
      .populate('movie', 'title duration genre')
      .populate('theater', 'name location');
    
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
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete showtime
const deleteShowtime = async (req, res) => {
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
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  addShowtime,
  getAllShowtimes,
  deleteShowtime
}; 