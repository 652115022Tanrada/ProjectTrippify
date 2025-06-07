const { callGeminiAPI, generateTripPrompt } = require('../services/geminiService');

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
