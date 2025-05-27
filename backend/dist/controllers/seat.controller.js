"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSeat = exports.getAllSeats = exports.addSeat = void 0;
const seat_model_1 = __importDefault(require("../model/seat.model"));
const theater_model_1 = __importDefault(require("../model/theater.model"));
// Add new seat
const addSeat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { theater, seatNumber, row } = req.body;
        if (!theater || !seatNumber || !row) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        // Check if theater exists and get current seat count
        const theaterExists = yield theater_model_1.default.findById(theater);
        if (!theaterExists) {
            return res.status(404).json({ message: 'Theater not found' });
        }
        // Get current seat count for the theater
        const currentSeatCount = yield seat_model_1.default.countDocuments({ theater: theater });
        // Check if adding new seat would exceed theater capacity
        if (currentSeatCount >= theaterExists.capacity) {
            return res.status(400).json({
                message: 'Cannot add more seats. Theater has reached maximum capacity',
                currentCapacity: currentSeatCount,
                maxCapacity: theaterExists.capacity
            });
        }
        // Check if seat already exists in the theater
        const existingSeat = yield seat_model_1.default.findOne({
            theater,
            seatNumber,
            row
        });
        if (existingSeat) {
            return res.status(400).json({ message: 'Seat already exists in this theater' });
        }
        const seat = yield seat_model_1.default.create({
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
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.addSeat = addSeat;
// Get all seats
const getAllSeats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const seats = yield seat_model_1.default.find().populate('theater', 'name location capacity');
        // Calculate remaining capacity for each theater
        const theaterSeats = {};
        seats.forEach(seat => {
            const theaterId = seat.theater._id.toString();
            if (!theaterSeats[theaterId]) {
                theaterSeats[theaterId] = {
                    theater: seat.theater,
                    totalSeats: 0,
                    remainingCapacity: seat.theater.capacity
                };
            }
            theaterSeats[theaterId].totalSeats++;
            theaterSeats[theaterId].remainingCapacity--;
        });
        res.status(200).json({
            success: true,
            count: seats.length,
            data: seats,
            theaterCapacity: Object.values(theaterSeats)
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.getAllSeats = getAllSeats;
// Delete seat
const deleteSeat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const seat = yield seat_model_1.default.findById(id);
        if (!seat) {
            return res.status(404).json({ message: 'Seat not found' });
        }
        // Get theater details before deleting seat
        const theater = yield theater_model_1.default.findById(seat.theater);
        const currentSeatCount = yield seat_model_1.default.countDocuments({ theater: seat.theater });
        // Delete the seat
        yield seat_model_1.default.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: 'Seat deleted successfully',
            remainingCapacity: theater.capacity - (currentSeatCount - 1)
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.deleteSeat = deleteSeat;
