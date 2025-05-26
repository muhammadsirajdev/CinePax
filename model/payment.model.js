const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  ticket:        { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Ticket', 
    required: true 
},
  amount:        { 
    type: Number, 
    required: true 
},
  paymentMethod: { 
    type: String, 
    required: true 
},
  paymentDate:   {
    type: Date, 
    default: Date.now 
}
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
