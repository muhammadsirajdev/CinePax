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
exports.deleteMovie = exports.getAllMovies = exports.addMovie = void 0;
const movie_model_1 = __importDefault(require("../model/movie.model"));
// Add new movie
const addMovie = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, duration, genre, releaseDate } = req.body;
        if (!title || !duration || !genre || !releaseDate) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const movie = yield movie_model_1.default.create({
            title,
            duration,
            genre,
            releaseDate
        });
        res.status(201).json({
            success: true,
            data: movie
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.addMovie = addMovie;
// Get all movies
const getAllMovies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const movies = yield movie_model_1.default.find();
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
exports.getAllMovies = getAllMovies;
// Delete movie
const deleteMovie = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const movie = yield movie_model_1.default.findById(id);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        yield movie_model_1.default.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: 'Movie deleted successfully'
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.deleteMovie = deleteMovie;
