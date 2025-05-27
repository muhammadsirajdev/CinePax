import mongoose, { Document, Schema, Types } from 'mongoose';
import { IMovie } from './movie.model';
import { ITheater } from './theater.model';

export interface IShowtime extends Document {
  movie: Types.ObjectId | IMovie;
  theater: Types.ObjectId | ITheater;
  startTime: Date;
  endTime: Date;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

const showtimeSchema = new Schema<IShowtime>({
  movie: {
    type: Schema.Types.ObjectId, 
    ref: 'Movie',
    required: true 
  },
  theater: { 
    type: Schema.Types.ObjectId,
    ref: 'Theater', 
    required: true
  },
  startTime: {
    type: Date, 
    required: true
  },
  endTime: {
    type: Date, 
    required: true 
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, { timestamps: true });

export default mongoose.model<IShowtime>('Showtime', showtimeSchema); 