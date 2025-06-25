const { callGeminiAPI} = require('../services/geminiService');
const tripModel = require('../models/tripModel');
exports.generateTripPlan = async (req, res) => {
  try {
    const tripData = req.body;
    const plan = await callGeminiAPI(tripData);
    res.json(plan);
  } catch (err) {
    console.error('Gemini API error:', err);
    res.status(500).json({ error: 'Failed to generate trip plan.' });
  }
};
exports.saveTrip = async (req, res) => {
  try {
    const userId = req.body.user_id 
    const tripData = req.body;

    const result = await tripModel.saveTrip(tripData, userId);

    res.status(201).json({ message: 'Trip saved successfully', tripId: result.tripId });
  } catch (err) {
    console.error('Save trip error:', err);
    res.status(500).json({ error: 'Failed to save trip' });
  }
};
