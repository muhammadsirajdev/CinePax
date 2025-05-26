const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  theater:    { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Theater', 
    required: true 
},
  firstName:  { 
    type: String, 
    required: true 
},
  lastName:   { 
    type: String, 
    required: true 
},
  role:       { 
    type: String, 
    required: true 
}
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
