import mongoose, { Document, Schema } from 'mongoose';

export interface IMovie extends Document {
  title: string;
  duration: number;
  genre: string;
  releaseDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const movieSchema = new Schema<IMovie>({
  title: { 
    type: String, 
    required: true 
  },
  duration: {
    type: Number, 
    required: true
  }, 
  genre: {
    type: String, 
    required: true
  },
  releaseDate: { 
    type: Date, 
    required: true 
  }
}, { timestamps: true });

export default mongoose.model<IMovie>('Movie', movieSchema); 