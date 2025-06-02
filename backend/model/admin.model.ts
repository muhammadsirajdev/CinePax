import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export interface IAdmin extends Document {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
}

const adminSchema = new Schema<IAdmin>({
  fullName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

adminSchema.methods.isPasswordCorrect = async function(password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

adminSchema.methods.generateAccessToken = function(): string {
  const secret = process.env.JWT_SECRET || 'default_secret';
  const options: jwt.SignOptions = { expiresIn: '7d' };

  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      fullName: this.fullName,
      role: 'admin'
    },
    secret,
    options
  );
};

export default mongoose.model<IAdmin>('Admin', adminSchema); 