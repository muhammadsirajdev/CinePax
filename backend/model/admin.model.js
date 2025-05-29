const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

adminSchema.methods.isPasswordCorrect = async function(password) {
  return await bcrypt.compare(password, this.password);
};

adminSchema.methods.generateAccessToken = function() {
  const secret = process.env.JWT_SECRET || 'default_secret';
  const options = { expiresIn: '7d' };

  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      fullName: this.fullName,
      isAdmin: true
    },
    secret,
    options
  );
};

module.exports = mongoose.model('Admin', adminSchema); 