import mongoose, { Document, Schema } from 'mongoose';

export interface ITheater extends Document {
  name: string;
  location: string;
  capacity: number;
  createdAt: Date;
  updatedAt: Date;
}

const theaterSchema = new Schema<ITheater>({
  name: { 
    type: String, 
    required: true 
  },
  location: {
    type: String, 
    required: true 
  },
  capacity: { 
    type: Number, 
    required: true 
  }
}, { timestamps: true });

export default mongoose.model<ITheater>('Theater', theaterSchema); 