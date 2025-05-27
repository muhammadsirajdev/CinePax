"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const connect_1 = __importDefault(require("./connect"));
// Import routes
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const customer_route_1 = __importDefault(require("./routes/customer.route"));
const movie_route_1 = __importDefault(require("./routes/movie.route"));
const theater_route_1 = __importDefault(require("./routes/theater.route"));
const staff_route_1 = __importDefault(require("./routes/staff.route"));
const seat_route_1 = __importDefault(require("./routes/seat.route"));
const showtime_route_1 = __importDefault(require("./routes/showtime.route"));
const ticket_route_1 = __importDefault(require("./routes/ticket.route"));
const payment_route_1 = __importDefault(require("./routes/payment.route"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(express_1.default.json());
app.use((req, res, next) => {
    console.log(`Incoming ${req.method} request to ${req.url}`);
    next();
});
// Routes
app.use('/', auth_route_1.default);
app.use('/user', customer_route_1.default);
app.use('/movies', movie_route_1.default);
app.use('/theaters', theater_route_1.default);
app.use('/staff', staff_route_1.default);
app.use('/seats', seat_route_1.default);
app.use('/showtimes', showtime_route_1.default);
app.use('/tickets', ticket_route_1.default);
app.use('/payments', payment_route_1.default);
app.get('/', (req, res) => {
    res.send('Backend server is running!');
});
(0, connect_1.default)(process.env.MONGO_URI || '')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
