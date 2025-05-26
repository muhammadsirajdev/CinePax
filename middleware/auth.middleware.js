const jwt = require('jsonwebtoken');
const Blacklist = require('../model/blacklist.model');

// Middleware to verify access token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Access Denied: No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access Denied: Invalid token format' });

  try {
    // Check if token is blacklisted
    const blacklisted = await Blacklist.findOne({ token });
    if (blacklisted) {
      return res.status(401).json({ message: 'Token has been logged out' });
    }

    // Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // includes isAdmin if admin

    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: 'Forbidden: Admin access only' });
  }
  next();
};

module.exports = { verifyToken, isAdmin };
