const Movie = require('../model/movie.model');

// Add new movie
const addMovie = async (req, res) => {
  try {
    const { title, duration, genre, releaseDate } = req.body;

    if (!title || !duration || !genre || !releaseDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const movie = await Movie.create({
      title,
      duration,
      genre,
      releaseDate
    });

    res.status(201).json({
      success: true,
      data: movie
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all movies
const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// Delete movie
const deleteMovie = async (req, res) => {
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
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  addMovie,
  getAllMovies,
  deleteMovie
}; 