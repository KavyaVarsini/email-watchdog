const express = require('express');
const router = express.Router();
const { googleAuth, googleCallback, getProfile, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.get('/profile', protect, getProfile);
router.post('/logout', logout);

module.exports = router;
