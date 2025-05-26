const Customer = require('../model/customer.model');
const Admin = require('../model/admin.model');
const Blacklist = require('../model/blacklist.model');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Customer Signup (Admin cannot signup)
const signupUser = async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;

    // Check if email is already registered (as customer)
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) return res.status(400).json({ message: 'Email already registered' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save customer
    const newCustomer = new Customer({ email, password: hashedPassword, fullName, phone });
    await newCustomer.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Unified Login (Admin or Customer)
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // First, check if credentials match admin
    const admin = await Admin.findOne({ email });
    if (admin) {
      const isValid = await admin.isPasswordCorrect(password);
      if (!isValid) return res.status(401).json({ message: 'Invalid admin credentials' });

      const token = jwt.sign(
        {
          id: admin._id,
          email: admin.email,
          isAdmin: true
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return res.status(200).json({ token, role: 'admin', message: 'Admin login successful' });
    }

    // Otherwise, check if customer
    const customer = await Customer.findOne({ email });
    if (!customer) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign(
      {
        id: customer._id,
        email: customer.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, role: 'customer', message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Logout and blacklist token
const logoutUser = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(400).json({ message: 'Authorization token missing' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(400).json({ message: 'Token missing' });

    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    const expiresAt = new Date(decoded.exp * 1000);
    await new Blacklist({ token, expiresAt }).save();

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current customer's profile (protected route)
const getProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).select('-password');
    if (!customer) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  signupUser,
  loginUser,
  logoutUser,
  getProfile
};
