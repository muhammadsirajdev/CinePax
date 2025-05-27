import mongoose, { Document, Schema, Types } from 'mongoose';
import { ITheater } from './theater.model';

export interface IStaff extends Document {
  theater: Types.ObjectId | ITheater;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const staffSchema = new Schema<IStaff>({
  theater: { 
    type: Schema.Types.ObjectId, 
    ref: 'Theater', 
    required: true 
  },
  firstName: { 
    type: String, 
    required: true 
  },
  lastName: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    required: true 
  }
}, { timestamps: true });

export default mongoose.model<IStaff>('Staff', staffSchema); 