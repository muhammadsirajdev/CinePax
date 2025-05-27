const mongoose = require('mongoose');

const dotenv = require('dotenv');
dotenv.config();
const MONGO_URI = process.env.MONGO_URI;
const connectDB = async (mongoUri) => {
 return mongoose.connect(mongoUri);
}

module.exports = connectDB;
