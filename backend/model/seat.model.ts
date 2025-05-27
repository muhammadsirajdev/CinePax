import mongoose, { Document, Schema, Types } from 'mongoose';
import { ITheater } from './theater.model';

export interface ISeat extends Document {
  theater: Types.ObjectId | ITheater;
  seatNumber: string;
  row: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const seatSchema = new Schema<ISeat>({
  theater: {
    type: Schema.Types.ObjectId,
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

export default mongoose.model<ISeat>('Seat', seatSchema); 