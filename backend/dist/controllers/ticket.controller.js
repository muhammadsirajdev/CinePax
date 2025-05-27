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
exports.getBookedTicketsByShowtime = exports.getAllBookedTickets = void 0;
const ticket_model_1 = __importDefault(require("../model/ticket.model"));
const showtime_model_1 = __importDefault(require("../model/showtime.model"));
const theater_model_1 = __importDefault(require("../model/theater.model"));
// Get all booked tickets (admin only)
const getAllBookedTickets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tickets = yield ticket_model_1.default.find()
            .populate({
            path: 'showtime',
            populate: [
                { path: 'movie', select: 'title duration genre' },
                { path: 'theater', select: 'name location capacity' }
            ]
        })
            .populate('customer', 'fullName email phone')
            .populate('seat', 'seatNumber row');
        // Calculate available seats for each theater
        const theaterStats = {};
        tickets.forEach(ticket => {
            const theaterId = ticket.showtime.theater._id.toString();
            if (!theaterStats[theaterId]) {
                theaterStats[theaterId] = {
                    theater: ticket.showtime.theater,
                    totalSeats: ticket.showtime.theater.capacity,
                    bookedSeats: 0,
                    availableSeats: ticket.showtime.theater.capacity
                };
            }
            theaterStats[theaterId].bookedSeats++;
            theaterStats[theaterId].availableSeats--;
        });
        res.status(200).json({
            success: true,
            count: tickets.length,
            data: tickets,
            theaterStats: Object.values(theaterStats)
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.getAllBookedTickets = getAllBookedTickets;
// Get booked tickets by showtime (admin only)
const getBookedTicketsByShowtime = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { showtimeId } = req.params;
        // Check if showtime exists
        const showtime = yield showtime_model_1.default.findById(showtimeId);
        if (!showtime) {
            return res.status(404).json({ message: 'Showtime not found' });
        }
        const tickets = yield ticket_model_1.default.find({ showtime: showtimeId })
            .populate('customer', 'fullName email phone')
            .populate('seat', 'seatNumber row');
        // Get theater capacity
        const theater = yield theater_model_1.default.findById(showtime.theater);
        const totalSeats = theater.capacity;
        const bookedSeats = tickets.length;
        const availableSeats = totalSeats - bookedSeats;
        res.status(200).json({
            success: true,
            count: tickets.length,
            showtime: {
                movie: showtime.movie,
                theater: showtime.theater,
                startTime: showtime.startTime,
                endTime: showtime.endTime,
                price: showtime.price
            },
            seatStats: {
                totalSeats,
                bookedSeats,
                availableSeats
            },
            data: tickets
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.getBookedTicketsByShowtime = getBookedTicketsByShowtime;
