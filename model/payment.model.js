const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  ticket: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Ticket', 
    required: true 
  },
  paymentMethod: { 
    type: String, 
    required: true,
    enum: ['CASH', 'CARD', 'ONLINE']
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['PENDING', 'COMPLETED', 'FAILED'],
    default: 'PENDING'
  },
  paymentDate: {
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);

