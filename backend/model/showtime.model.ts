import mongoose, { Schema, Document } from 'mongoose';

export interface IShowtime extends Document {
  movieId: mongoose.Types.ObjectId;
  theaterId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  price: number;
  availableSeats: number;
  createdAt: Date;
  updatedAt: Date;
}

const ShowtimeSchema = new Schema({
  movieId: {
    type: Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  theaterId: {
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
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

export default mongoose.model<IShowtime>('Showtime', ShowtimeSchema); 