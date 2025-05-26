const Staff = require('../model/staff.model');
const Theater = require('../model/theater.model');

// Add new staff
const addStaff = async (req, res) => {
  try {
    const { theater, firstName, lastName, role } = req.body;

    if (!theater || !firstName || !lastName || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if theater exists
    const theaterExists = await Theater.findById(theater);
    if (!theaterExists) {
      return res.status(404).json({ message: 'Theater not found' });
    }

    const staff = await Staff.create({
      theater,
      firstName,
      lastName,
      role
    });

    res.status(201).json({
      success: true,
      data: staff
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all staff
const getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find().populate('theater', 'name location');
    res.status(200).json({
      success: true,
      count: staff.length,
      data: staff
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete staff
const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findById(id);
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    await Staff.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: 'Staff deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  addStaff,
  getAllStaff,
  deleteStaff
}; 