const express = require('express');
const router = express.Router();
const { getStats, getActivity } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, getStats);
router.get('/activity', protect, getActivity);

module.exports = router;
