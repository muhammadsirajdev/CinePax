const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
  token: { 
    type: String, 
    required: true 
},
  expiresAt: { 
    type: Date, 
    required: true 
}
});

// Automatically delete expired tokens from blacklist collection
blacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Blacklist = mongoose.model('Blacklist', blacklistSchema);
module.exports = Blacklist;
