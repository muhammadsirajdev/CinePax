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
exports.deleteTheater = exports.getAllTheaters = exports.addTheater = void 0;
const theater_model_1 = __importDefault(require("../model/theater.model"));
// Add new theater
const addTheater = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, location, capacity } = req.body;
        if (!name || !location || !capacity) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const theater = yield theater_model_1.default.create({
            name,
            location,
            capacity
        });
        res.status(201).json({
            success: true,
            data: theater
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.addTheater = addTheater;
// Get all theaters
const getAllTheaters = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const theaters = yield theater_model_1.default.find();
        res.status(200).json({
            success: true,
            count: theaters.length,
            data: theaters
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.getAllTheaters = getAllTheaters;
// Delete theater
const deleteTheater = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const theater = yield theater_model_1.default.findById(id);
        if (!theater) {
            return res.status(404).json({ message: 'Theater not found' });
        }
        yield theater_model_1.default.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: 'Theater deleted successfully'
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.deleteTheater = deleteTheater;
