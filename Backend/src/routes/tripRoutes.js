const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

// ✅ ใช้งาน generateTripPlan ที่เขียนไว้ใน controller
router.post('/', tripController.generateTripPlan);

module.exports = router;
