import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (mongoUri: string): Promise<typeof mongoose> => {
  return mongoose.connect(mongoUri);
};

export default connectDB; 