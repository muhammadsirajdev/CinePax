import mongoose, { Document, Schema, Types } from 'mongoose';
import { ITicket } from './ticket.model';

export type PaymentMethod = 'CASH' | 'CARD' | 'ONLINE';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface IPayment extends Document {
  ticket: Types.ObjectId | ITicket;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>({
  ticket: { 
    type: Schema.Types.ObjectId, 
    ref: 'Ticket', 
    required: true 
  },
  paymentMethod: { 
    type: String, 
    required: true,
    enum: ['CASH', 'CARD', 'ONLINE']
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['PENDING', 'COMPLETED', 'FAILED'],
    default: 'PENDING'
  },
  paymentDate: {
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

export default mongoose.model<IPayment>('Payment', paymentSchema); 