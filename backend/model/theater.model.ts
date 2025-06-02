import mongoose, { Schema, Document } from 'mongoose';

export interface ITheater extends Document {
  name: string;
  location: string;
  capacity: number;
  screens?: number;
  amenities?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TheaterSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  screens: {
    type: Number,
    min: 1,
    default: 1
  },
  amenities: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

export default mongoose.model<ITheater>('Theater', TheaterSchema); 