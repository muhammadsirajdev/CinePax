import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Customer, { ICustomer } from '../model/customer.model';
import Admin, { IAdmin } from '../model/admin.model';
import Blacklist from '../model/blacklist.model';

interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface JwtPayload {
  id: string;
  email: string;
  isAdmin?: boolean;
  exp?: number;
}

// Customer Signup (Admin cannot signup)
export const signupUser = async (req: Request<{}, {}, SignupRequest>, res: Response) => {
  try {
    const { email, password, fullName, phone } = req.body;

    // Check if email is already registered (as customer)
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) return res.status(400).json({ message: 'Email already registered' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save customer
    const newCustomer = new Customer({ email, password: hashedPassword, fullName, phone });
    await newCustomer.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Unified Login (Admin or Customer)
export const loginUser = async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  const { email, password } = req.body;

  try {
    // First, check if credentials match admin
    const admin = await Admin.findOne({ email });
    if (admin) {
      const isValid = await admin.isPasswordCorrect(password);
      if (!isValid) return res.status(401).json({ message: 'Invalid admin credentials' });

      const token = jwt.sign(
        {
          id: admin._id,
          email: admin.email,
          role: 'admin'
        },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '1h' }
      );

      return res.status(200).json({ token, role: 'admin', message: 'Admin login successful' });
    }

    // Otherwise, check if customer
    const customer = await Customer.findOne({ email });
    if (!customer) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign(
      {
        id: customer._id,
        email: customer.email,
        role: 'customer'
      },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, role: 'customer', message: 'Login successful' });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Logout and blacklist token
export const logoutUser = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(400).json({ message: 'Authorization token missing' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(400).json({ message: 'Token missing' });

    const decoded = jwt.decode(token) as JwtPayload;
    if (!decoded || !decoded.exp) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    const expiresAt = new Date(decoded.exp * 1000);
    await new Blacklist({ token, expiresAt }).save();

    res.status(200).json({ message: 'Logout successful' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current user's profile (protected route)
export const getProfile = async (req: Request, res: Response) => {
  try {
    // First try to find in customers
    const customer = await Customer.findById(req.user?.id).select('-password');
    if (customer) {
      return res.status(200).json(customer);
    }
    
    // If not found in customers, try admins
    const admin = await Admin.findById(req.user?.id).select('-password');
    if (admin) {
      return res.status(200).json(admin);
    }

    return res.status(404).json({ message: 'User not found' });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update current user's profile (protected route)
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone } = req.body;
    
    // First try to find in customers
    const customer = await Customer.findById(req.user?.id);
    if (customer) {
      if (fullName) customer.fullName = fullName;
      if (email) customer.email = email;
      if (phone) customer.phone = phone;
      await customer.save();

      const customerObj = customer.toObject();
      const { password, ...customerResponse } = customerObj;
      return res.status(200).json(customerResponse);
    }
    
    // If not found in customers, try admins
    const admin = await Admin.findById(req.user?.id);
    if (admin) {
      if (fullName) admin.fullName = fullName;
      if (email) admin.email = email;
      if (phone) admin.phone = phone;
      await admin.save();

      const adminObj = admin.toObject();
      const { password, ...adminResponse } = adminObj;
      return res.status(200).json(adminResponse);
    }

    return res.status(404).json({ message: 'User not found' });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 