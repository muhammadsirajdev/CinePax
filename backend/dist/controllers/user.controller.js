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
exports.cancelBooking = exports.getBookingHistory = exports.filterShowtimes = exports.searchMovies = exports.getUserTickets = exports.bookTicket = exports.getShowtimeDetails = exports.getMovieDetails = exports.getAllMoviesWithShowtimes = void 0;
const movie_model_1 = __importDefault(require("../model/movie.model"));
const showtime_model_1 = __importDefault(require("../model/showtime.model"));
const ticket_model_1 = __importDefault(require("../model/ticket.model"));
const payment_model_1 = __importDefault(require("../model/payment.model"));
// Get all movies with their showtimes
const getAllMoviesWithShowtimes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const movies = yield movie_model_1.default.find().lean();
        const showtimes = yield showtime_model_1.default.find()
            .populate('movie', 'title description duration genre releaseDate posterUrl')
            .populate('theater', 'name location capacity')
            .lean();
        // Group showtimes by movie
        const moviesWithShowtimes = movies.map(movie => {
            const movieShowtimes = showtimes.filter(showtime => showtime.movie._id.toString() === movie._id.toString());
            return Object.assign(Object.assign({}, movie), { showtimes: movieShowtimes.map(showtime => ({
                    id: showtime._id,
                    theater: showtime.theater,
                    startTime: showtime.startTime,
                    endTime: showtime.endTime,
                    price: showtime.price
                })) });
        });
        res.status(200).json({
            success: true,
            count: moviesWithShowtimes.length,
            data: moviesWithShowtimes
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.getAllMoviesWithShowtimes = getAllMoviesWithShowtimes;
// Get movie details with available showtimes and seat availability
const getMovieDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { movieId } = req.params;
        const movie = yield movie_model_1.default.findById(movieId).lean();
        if (!movie) {
            res.status(404).json({ message: 'Movie not found' });
            return;
        }
        const showtimes = yield showtime_model_1.default.find({ movie: movieId })
            .populate('theater', 'name location capacity')
            .lean();
        // Get seat availability for each showtime
        const showtimesWithAvailability = yield Promise.all(showtimes.map((showtime) => __awaiter(void 0, void 0, void 0, function* () {
            const bookedTickets = yield ticket_model_1.default.find({ showtime: showtime._id });
            const bookedSeats = bookedTickets.map(ticket => ticket.seat);
            const availableSeats = showtime.theater.capacity - bookedSeats.length;
            return {
                id: showtime._id,
                theater: showtime.theater,
                startTime: showtime.startTime,
                endTime: showtime.endTime,
                price: showtime.price,
                availableSeats,
                bookedSeats: bookedSeats.length
            };
        })));
        res.status(200).json({
            success: true,
            data: Object.assign(Object.assign({}, movie), { showtimes: showtimesWithAvailability })
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.getMovieDetails = getMovieDetails;
// Get showtime details with seat availability
const getShowtimeDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { showtimeId } = req.params;
        const showtime = yield showtime_model_1.default.findById(showtimeId)
            .populate('movie', 'title description duration genre releaseDate posterUrl')
            .populate('theater', 'name location capacity')
            .lean();
        if (!showtime) {
            res.status(404).json({ message: 'Showtime not found' });
            return;
        }
        const bookedTickets = yield ticket_model_1.default.find({ showtime: showtimeId });
        const bookedSeats = bookedTickets.map(ticket => ticket.seat);
        const availableSeats = showtime.theater.capacity - bookedSeats.length;
        res.status(200).json({
            success: true,
            data: Object.assign(Object.assign({}, showtime), { availableSeats, bookedSeats: bookedSeats.length, seatAvailability: {
                    total: showtime.theater.capacity,
                    available: availableSeats,
                    booked: bookedSeats.length
                } })
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.getShowtimeDetails = getShowtimeDetails;
// Book a ticket
const bookTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { showtimeId, seatNumber, row } = req.body;
        const customerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!customerId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        // Check if showtime exists
        const showtime = yield showtime_model_1.default.findById(showtimeId)
            .populate('theater', 'capacity')
            .lean();
        if (!showtime) {
            res.status(404).json({ message: 'Showtime not found' });
            return;
        }
        // Check if seat is already booked
        const existingTicket = yield ticket_model_1.default.findOne({
            showtime: showtimeId,
            seat: { seatNumber, row }
        });
        if (existingTicket) {
            res.status(400).json({ message: 'Seat is already booked' });
            return;
        }
        // Create ticket
        const ticket = yield ticket_model_1.default.create({
            showtime: showtimeId,
            customer: customerId,
            seat: { seatNumber, row },
            price: showtime.price
        });
        // Create payment (hypothetical for now)
        const payment = yield payment_model_1.default.create({
            ticket: ticket._id,
            amount: showtime.price,
            paymentMethod: 'ONLINE',
            paymentStatus: 'COMPLETED'
        });
        res.status(201).json({
            success: true,
            data: {
                ticket,
                payment
            }
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.bookTicket = bookTicket;
// Get user's booked tickets
const getUserTickets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const customerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!customerId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const tickets = yield ticket_model_1.default.find({ customer: customerId })
            .populate({
            path: 'showtime',
            populate: [
                { path: 'movie', select: 'title duration genre posterUrl' },
                { path: 'theater', select: 'name location' }
            ]
        })
            .populate('seat', 'seatNumber row')
            .lean();
        res.status(200).json({
            success: true,
            count: tickets.length,
            data: tickets
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.getUserTickets = getUserTickets;
// Search movies by title/genre
const searchMovies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, genre } = req.query;
        const query = {};
        if (title) {
            query.title = { $regex: title, $options: 'i' };
        }
        if (genre) {
            query.genre = { $regex: genre, $options: 'i' };
        }
        const movies = yield movie_model_1.default.find(query).lean();
        res.status(200).json({
            success: true,
            count: movies.length,
            data: movies
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.searchMovies = searchMovies;
// Filter showtimes by date/time
const filterShowtimes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate, time } = req.query;
        const query = {};
        if (startDate || endDate) {
            query.startTime = {};
            if (startDate) {
                query.startTime.$gte = new Date(startDate);
            }
            if (endDate) {
                query.startTime.$lte = new Date(endDate);
            }
        }
        if (time) {
            const [hours, minutes] = time.split(':').map(Number);
            const timeDate = new Date();
            timeDate.setHours(hours, minutes, 0, 0);
            query.startTime = Object.assign(Object.assign({}, query.startTime), { $gte: timeDate });
        }
        const showtimes = yield showtime_model_1.default.find(query)
            .populate('movie', 'title duration genre posterUrl')
            .populate('theater', 'name location')
            .lean();
        res.status(200).json({
            success: true,
            count: showtimes.length,
            data: showtimes
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.filterShowtimes = filterShowtimes;
// Get detailed booking history
const getBookingHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const customerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!customerId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const tickets = yield ticket_model_1.default.find({ customer: customerId })
            .populate({
            path: 'showtime',
            populate: [
                { path: 'movie', select: 'title duration genre posterUrl' },
                { path: 'theater', select: 'name location' }
            ]
        })
            .populate('seat', 'seatNumber row')
            .sort({ createdAt: -1 })
            .lean();
        const bookingHistory = tickets.map(ticket => ({
            ticketId: ticket._id,
            movie: ticket.showtime.movie,
            theater: ticket.showtime.theater,
            showtime: {
                startTime: ticket.showtime.startTime,
                endTime: ticket.showtime.endTime
            },
            seat: ticket.seat,
            price: ticket.price,
            bookingDate: ticket.createdAt,
            status: 'confirmed' // You can add more statuses like 'cancelled', 'refunded', etc.
        }));
        res.status(200).json({
            success: true,
            count: bookingHistory.length,
            data: bookingHistory
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.getBookingHistory = getBookingHistory;
// Cancel booking
const cancelBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { ticketId } = req.params;
        const customerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!customerId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const ticket = yield ticket_model_1.default.findOne({ _id: ticketId, customer: customerId });
        if (!ticket) {
            res.status(404).json({ message: 'Ticket not found' });
            return;
        }
        // Check if showtime is in the future
        const showtime = yield showtime_model_1.default.findById(ticket.showtime);
        if (!showtime) {
            res.status(404).json({ message: 'Showtime not found' });
            return;
        }
        const showtimeDate = new Date(showtime.startTime);
        const currentDate = new Date();
        const hoursUntilShowtime = (showtimeDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60);
        // Only allow cancellation if showtime is more than 2 hours away
        if (hoursUntilShowtime <= 2) {
            res.status(400).json({ message: 'Cannot cancel booking less than 2 hours before showtime' });
            return;
        }
        // Delete the ticket
        yield ticket_model_1.default.findByIdAndDelete(ticketId);
        // Update payment status if exists
        yield payment_model_1.default.findOneAndUpdate({ ticket: ticketId }, { paymentStatus: 'REFUNDED' });
        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully'
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.cancelBooking = cancelBooking;
