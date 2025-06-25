const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

router.post('/', tripController.generateTripPlan);
router.post('/save', tripController.saveTrip);
module.exports = router;
