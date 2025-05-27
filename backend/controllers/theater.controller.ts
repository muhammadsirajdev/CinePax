import { Request, Response } from 'express';
import Theater from '../model/theater.model';

interface TheaterRequest {
  name: string;
  location: string;
  capacity: number;
}

// Add new theater
export const addTheater = async (req: Request<{}, {}, TheaterRequest>, res: Response) => {
  try {
    const { name, location, capacity } = req.body;

    if (!name || !location || !capacity) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const theater = await Theater.create({
      name,
      location,
      capacity
    });

    res.status(201).json({
      success: true,
      data: theater
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all theaters
export const getAllTheaters = async (req: Request, res: Response) => {
  try {
    const theaters = await Theater.find();
    res.status(200).json({
      success: true,
      count: theaters.length,
      data: theaters
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete theater
export const deleteTheater = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const theater = await Theater.findById(id);
    
    if (!theater) {
      return res.status(404).json({ message: 'Theater not found' });
    }

    await Theater.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: 'Theater deleted successfully'
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 