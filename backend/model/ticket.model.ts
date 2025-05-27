import mongoose, { Document, Schema, Types } from 'mongoose';
import { IShowtime } from './showtime.model';
import { ICustomer } from './customer.model';
import { ISeat } from './seat.model';

export interface ITicket extends Document {
  showtime: Types.ObjectId | IShowtime;
  customer: Types.ObjectId | ICustomer;
  seat: Types.ObjectId | ISeat;
  price: number;
  purchaseDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ticketSchema = new Schema<ITicket>({
  showtime: { 
    type: Schema.Types.ObjectId, 
    ref: 'Showtime', 
    required: true 
  },
  customer: { 
    type: Schema.Types.ObjectId, 
    ref: 'Customer', 
    required: true 
  },
  seat: { 
    type: Schema.Types.ObjectId, 
    ref: 'Seat', 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  purchaseDate: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

export default mongoose.model<ITicket>('Ticket', ticketSchema); 