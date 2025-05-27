import { Request, Response } from 'express';
import Seat from '../model/seat.model';
import Theater from '../model/theater.model';

// Add new seat
export const addSeat = async (req: Request, res: Response) => {
  try {
    const { theater, seatNumber, row } = req.body;

    if (!theater || !seatNumber || !row) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if theater exists and get current seat count
    const theaterExists = await Theater.findById(theater);
    if (!theaterExists) {
      return res.status(404).json({ message: 'Theater not found' });
    }

    // Get current seat count for the theater
    const currentSeatCount = await Seat.countDocuments({ theater: theater });
    
    // Check if adding new seat would exceed theater capacity
    if (currentSeatCount >= theaterExists.capacity) {
      return res.status(400).json({ 
        message: 'Cannot add more seats. Theater has reached maximum capacity',
        currentCapacity: currentSeatCount,
        maxCapacity: theaterExists.capacity
      });
    }

    // Check if seat already exists in the theater
    const existingSeat = await Seat.findOne({
      theater,
      seatNumber,
      row
    });

    if (existingSeat) {
      return res.status(400).json({ message: 'Seat already exists in this theater' });
    }

    const seat = await Seat.create({
      theater,
      seatNumber,
      row,
      isAvailable: true
    });

    res.status(201).json({
      success: true,
      data: seat,
      remainingCapacity: theaterExists.capacity - (currentSeatCount + 1)
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all seats
export const getAllSeats = async (req: Request, res: Response) => {
  try {
    const seats = await Seat.find().populate('theater', 'name location capacity');
    
    // Calculate remaining capacity for each theater
    const theaterSeats: Record<string, any> = {};
    seats.forEach(seat => {
      const theater: any = seat.theater;
      if (theater && typeof theater === 'object' && theater._id) {
        const theaterId = theater._id.toString();
        if (!theaterSeats[theaterId]) {
          theaterSeats[theaterId] = {
            theater: theater,
            totalSeats: 0,
            remainingCapacity: theater.capacity
          };
        }
        theaterSeats[theaterId].totalSeats++;
        theaterSeats[theaterId].remainingCapacity--;
      }
    });

    res.status(200).json({
      success: true,
      count: seats.length,
      data: seats,
      theaterCapacity: Object.values(theaterSeats)
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete seat
export const deleteSeat = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const seat = await Seat.findById(id);
    
    if (!seat) {
      return res.status(404).json({ message: 'Seat not found' });
    }

    // Get theater details before deleting seat
    const theater = await Theater.findById(seat.theater);
    const currentSeatCount = await Seat.countDocuments({ theater: seat.theater });

    // Delete the seat
    await Seat.findByIdAndDelete(id);

    if (!theater) {
      return res.status(404).json({ message: 'Theater not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Seat deleted successfully',
      remainingCapacity: theater.capacity - (currentSeatCount - 1)
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 