const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
  movie: {
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'Movie',
     required: true 
    },
  theater: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theater', 
    required: true
 },
  startTime: {
     type: Date, 
     required: true
     },
  endTime: {
     type: Date, 
     required: true 
    },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Showtime', showtimeSchema);
