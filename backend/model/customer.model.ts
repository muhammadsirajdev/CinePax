import mongoose, { Document, Schema } from 'mongoose';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export interface ICustomer extends Document {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

const customerSchema = new Schema<ICustomer>({
  fullName: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String,
    required: true
  },
  refreshToken: { 
    type: String 
  }
}, { timestamps: true });

customerSchema.methods.isPasswordCorrect = async function(password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

customerSchema.methods.generateAccessToken = function(): string {
  const secret = process.env.JWT_SECRET || 'default_secret';
  const options: jwt.SignOptions = { expiresIn: '15m' };
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      fullName: this.fullName
    },
    secret,
    options
  );
};

customerSchema.methods.generateRefreshToken = function(): string {
  const secret = process.env.JWT_SECRET || 'default_secret';
  const options: jwt.SignOptions = { expiresIn: '7d' };
  return jwt.sign(
    {
      id: this._id
    },
    secret,
    options
  );
};

export default mongoose.model<ICustomer>('Customer', customerSchema); 