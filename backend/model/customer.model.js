const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const customerSchema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: true 
},
  email:    { 
    type: String, 
    required: true, 
    unique: true 
},
  password: { 
    type: String, 
    required: true 
},
  phone:    { 
    type: String,
    required: true
},
  refreshToken: { 
    type: String 
}
}, { timestamps: true });



customerSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate JWT access token
customerSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      fullName: this.fullName
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' }
  );
};

// Generate refresh token
customerSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this._id
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
  );
};

module.exports = mongoose.model('Customer', customerSchema);
