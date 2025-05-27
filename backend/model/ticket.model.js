const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  showtime:  { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Showtime', 
    required: true 
},
  customer:  { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer', 
    required: true 
},
  seat:      { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Seat', 
    required: true 
},
  price:     { 
    type: Number, 
    required: true 
},
  purchaseDate: { 
    type: Date, 
    default: Date.now 
}
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
