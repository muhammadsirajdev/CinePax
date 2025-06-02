import mongoose, { Document, Schema } from 'mongoose';

export interface IMovie extends Document {
  title: string;
  year: number;
  duration: number;
  genre: string;
  releaseDate: Date;
  image: string;
  description: string;
  rating: number;
  director?: string;
  cast?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const movieSchema = new Schema<IMovie>(
  {
    title: { type: String, required: true },
    year: { type: Number, required: true },
    duration: { type: Number, required: true },
    genre: { type: String, required: true },
    releaseDate: { type: Date, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    rating: { type: Number, required: true },
    director: { type: String },
    cast: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model<IMovie>('Movie', movieSchema); 