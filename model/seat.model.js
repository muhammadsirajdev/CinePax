const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  theater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theater', 
    required: true 
},
  seatNumber: { 
    type: String, 
    required: true 
},
  row: { 
    type: String, 
    required: true 
},
  isAvailable: { 
    type: Boolean, 
    default: true
 }
}, { timestamps: true });

module.exports = mongoose.model('Seat', seatSchema);
