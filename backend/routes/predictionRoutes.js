// routes/predictionRoutes.js
import express from 'express';
import { predictCropAdvice } from '../controllers/predictionController.js';

const router = express.Router();

// Add console log for debugging
console.log("Setting up prediction routes");

// This is the route that matches your frontend request
router.post('/predict', predictCropAdvice);

console.log("Prediction routes set up complete!");

export default router;
