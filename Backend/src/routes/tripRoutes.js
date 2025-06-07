// routes/tripRoutes.js
const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const tripData = req.body;
  console.log('Received trip data:', tripData);
  res.json({ message: 'Trip saved successfully!', data: tripData });
});

module.exports = router;
