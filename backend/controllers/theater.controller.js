const Theater = require('../model/theater.model');

// Add new theater
const addTheater = async (req, res) => {
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
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all theaters
const getAllTheaters = async (req, res) => {
  try {
    const theaters = await Theater.find();
    res.status(200).json({
      success: true,
      count: theaters.length,
      data: theaters
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete theater
const deleteTheater = async (req, res) => {
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
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  addTheater,
  getAllTheaters,
  deleteTheater
}; 